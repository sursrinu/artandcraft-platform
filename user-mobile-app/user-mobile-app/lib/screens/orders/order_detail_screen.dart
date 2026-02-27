import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/order_provider.dart';
import '../../services/order_service.dart';

class OrderDetailScreen extends ConsumerWidget {
  final int orderId;

  const OrderDetailScreen({Key? key, required this.orderId}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final orderAsync = ref.watch(orderByIdProvider(orderId));
    final trackingAsync = ref.watch(orderTrackingProvider(orderId));

    return Scaffold(
      appBar: AppBar(title: const Text('Order Details')),
      body: orderAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => Center(child: Text('Error: $error')),
        data: (orderData) => SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Order Header
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            _getOrderNumber(orderData),
                            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          _buildStatusBadge(_getOrderStatus(orderData)),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Date: ${_getOrderDate(orderData)}',
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // Tracking Timeline
              Text(
                'Tracking',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 12),
              trackingAsync.when(
                loading: () => const CircularProgressIndicator(),
                error: (_, __) => const SizedBox.shrink(),
                data: (tracking) => _buildTrackingTimeline(context, tracking),
              ),
              const SizedBox(height: 24),

              // Order Items
              Text(
                'Items',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 12),
              ..._buildOrderItems(context, orderData),
              const SizedBox(height: 16),

              // Order Summary
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('Subtotal:'),
                          Text('₹${_getOrderSubtotal(orderData).toStringAsFixed(2)}'),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('Shipping:'),
                          Text('₹${_getOrderShipping(orderData).toStringAsFixed(2)}'),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Divider(),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Total:',
                            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          Text(
                            '₹${_getOrderTotal(orderData).toStringAsFixed(2)}',
                            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),

              // Action Buttons
              SizedBox(
                width: double.infinity,
                child: Column(
                  children: [
                    ElevatedButton(
                      onPressed: () {}, // Implement contact seller
                      child: const Text('Contact Seller'),
                    ),
                    const SizedBox(height: 8),
                    ElevatedButton(
                      onPressed: () {}, // Implement return request
                      child: const Text('Request Return'),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _getOrderNumber(dynamic orderData) {
    if (orderData is Order) return orderData.orderNumber;
    if (orderData is Map) return orderData['orderNumber'] ?? 'Order';
    return 'Order';
  }

  String _getOrderStatus(dynamic orderData) {
    if (orderData is Order) return orderData.status;
    if (orderData is Map) return orderData['status'] ?? 'pending';
    return 'pending';
  }

  String _getOrderDate(dynamic orderData) {
    if (orderData is Order) return orderData.createdAt.toIso8601String();
    if (orderData is Map) return orderData['createdAt'] ?? 'N/A';
    return 'N/A';
  }

  double _getOrderSubtotal(dynamic orderData) {
    if (orderData is Order) return orderData.subtotal;
    if (orderData is Map) {
      final v = orderData['subtotal'];
      if (v is num) return v.toDouble();
      return double.tryParse(v?.toString() ?? '') ?? 0;
    }
    return 0;
  }

  double _getOrderShipping(dynamic orderData) {
    if (orderData is Order) return orderData.shipping;
    if (orderData is Map) {
      final v = orderData['shipping'] ?? 10;
      if (v is num) return v.toDouble();
      return double.tryParse(v?.toString() ?? '') ?? 0;
    }
    return 0;
  }

  double _getOrderTotal(dynamic orderData) {
    if (orderData is Order) return orderData.total;
    if (orderData is Map) {
      final v = orderData['total'];
      if (v is num) return v.toDouble();
      return double.tryParse(v?.toString() ?? '') ?? 0;
    }
    return 0;
  }

  List<Widget> _buildOrderItems(BuildContext context, dynamic orderData) {
    final List<Widget> widgets = [];

    if (orderData is Order) {
      for (final item in orderData.items) {
        widgets.add(
          Card(
            margin: const EdgeInsets.only(bottom: 12),
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Row(
                children: [
                  Container(
                    width: 60,
                    height: 60,
                    color: Colors.grey[200],
                    child: Icon(Icons.image, color: Colors.grey[400]),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(item.productName),
                        Text(
                          'Qty: ${item.quantity}',
                          style: Theme.of(context).textTheme.bodySmall,
                        ),
                      ],
                    ),
                  ),
                  Text('₹${item.price.toStringAsFixed(2)}'),
                ],
              ),
            ),
          ),
        );
      }
    } else if (orderData is Map) {
      final rawItems = orderData['items'] as List?;
      if (rawItems != null) {
        for (final raw in rawItems) {
          final item = raw as Map;
          widgets.add(
            Card(
              margin: const EdgeInsets.only(bottom: 12),
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Row(
                  children: [
                    Container(
                      width: 60,
                      height: 60,
                      color: Colors.grey[200],
                      child: Icon(Icons.image, color: Colors.grey[400]),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(item['productName'] ?? 'Product'),
                          Text(
                            'Qty: ${item['quantity']}',
                            style: Theme.of(context).textTheme.bodySmall,
                          ),
                        ],
                      ),
                    ),
                    Text('₹${item['price']}'),
                  ],
                ),
              ),
            ),
          );
        }
      }
    }

    return widgets;
  }

  Widget _buildStatusBadge(String status) {
    Color color = Colors.grey;
    switch (status.toLowerCase()) {
      case 'pending':
        color = Colors.orange;
        break;
      case 'confirmed':
        color = Colors.blue;
        break;
      case 'shipped':
        color = Colors.purple;
        break;
      case 'delivered':
        color = Colors.green;
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.2),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        status.toUpperCase(),
        style: TextStyle(color: color, fontSize: 12, fontWeight: FontWeight.bold),
      ),
    );
  }

  Widget _buildTrackingTimeline(BuildContext context, dynamic tracking) {
    List events = [];
    if (tracking is Map && tracking['events'] is List) {
      events = tracking['events'];
    } else if (tracking is List) {
      events = tracking;
    }

    if (events.isEmpty) {
      return Text(
        'No tracking information available',
        style: Theme.of(context).textTheme.bodySmall,
      );
    }

    return Column(
      children: events.asMap().entries.map((entry) {
        int index = entry.key;
        dynamic event = entry.value;
        bool isLast = index == events.length - 1;

        return Column(
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Column(
                  children: [
                    Container(
                      width: 12,
                      height: 12,
                      decoration: BoxDecoration(
                        color: Colors.green,
                        borderRadius: BorderRadius.circular(6),
                      ),
                    ),
                    if (!isLast)
                      Container(
                        width: 2,
                        height: 30,
                        color: Colors.grey[300],
                      ),
                  ],
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        event['status'] ?? 'Event',
                        style: const TextStyle(fontWeight: FontWeight.bold),
                      ),
                      Text(
                        event['date'] ?? '',
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                    ],
                  ),
                ),
              ],
            ),
            if (!isLast) const SizedBox(height: 12),
          ],
        );
      }).toList(),
    );
  }
}
