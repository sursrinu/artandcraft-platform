import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/product_provider.dart';
import '../../providers/cart_provider_new.dart';
import '../../providers/order_provider.dart';
import '../../providers/user_provider.dart';
import '../../services/product_service.dart';
import '../../services/order_service.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
    @override
    void initState() {
      super.initState();
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) {
          ScaffoldMessenger.of(context).clearSnackBars();
        }
      });
    }

    @override
    void didChangeDependencies() {
      super.didChangeDependencies();
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) {
          ScaffoldMessenger.of(context).clearSnackBars();
        }
      });
    }
  int _selectedIndex = 0;
  String _searchQuery = '';
  int? _selectedCategoryId;

  @override
  Widget build(BuildContext context) {
    final cartAsync = ref.watch(cartProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Art & Craft Store'),
        elevation: 1,
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        actions: [
          cartAsync.when(
            loading: () => const Center(child: SizedBox(
              width: 20,
              height: 20,
              child: CircularProgressIndicator(strokeWidth: 2),
            )),
            error: (_, __) => const SizedBox.shrink(),
            data: (cart) {
              int itemCount = 0;
              if (cart != null && cart.items.isNotEmpty) {
                itemCount = cart.items.length;
              }
              return Badge(
                label: Text(itemCount.toString()),
                child: IconButton(
                  icon: const Icon(Icons.shopping_cart_outlined),
                  onPressed: () => Navigator.of(context).pushNamed('/cart'),
                ),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.person_outlined),
            onPressed: () => Navigator.of(context).pushNamed('/profile'),
          ),
        ],
      ),
      body: _buildBody(),
      bottomNavigationBar: BottomNavigationBar(
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Home'),
          BottomNavigationBarItem(icon: Icon(Icons.shopping_bag), label: 'Orders'),
          BottomNavigationBarItem(icon: Icon(Icons.favorite), label: 'Wishlist'),
        ],
        currentIndex: _selectedIndex,
        onTap: (index) => setState(() => _selectedIndex = index),
      ),
    );
  }

  Widget _buildBody() {
    switch (_selectedIndex) {
      case 0:
        return _ProductListView(
          searchQuery: _searchQuery,
          selectedCategoryId: _selectedCategoryId,
          onSearchChanged: (query) => setState(() => _searchQuery = query),
          onCategoryChanged: (categoryId) => setState(() => _selectedCategoryId = categoryId),
        );
      case 1:
        return const _OrdersView();
      case 2:
        return const _WishlistView();
      default:
        return const _ProductListView();
    }
  }
}

class _ProductListView extends ConsumerStatefulWidget {
  final String searchQuery;
  final int? selectedCategoryId;
  final Function(String) onSearchChanged;
  final Function(int?) onCategoryChanged;

  const _ProductListView({
    this.searchQuery = '',
    this.selectedCategoryId,
    Function(String)? onSearchChanged,
    Function(int?)? onCategoryChanged,
  })
      : onSearchChanged = onSearchChanged ?? _defaultOnSearchChanged,
        onCategoryChanged = onCategoryChanged ?? _defaultOnCategoryChanged;

  static void _defaultOnSearchChanged(String query) {}
  static void _defaultOnCategoryChanged(int? categoryId) {}

  @override
  ConsumerState<_ProductListView> createState() => _ProductListViewState();
}

class _ProductListViewState extends ConsumerState<_ProductListView> {
  late TextEditingController _searchController;

  @override
  void initState() {
    super.initState();
    _searchController = TextEditingController(text: widget.searchQuery);
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // Determine which provider to watch based on filters
    final productsAsync = widget.searchQuery.isNotEmpty
        ? ref.watch(searchProductsProvider(widget.searchQuery))
        : widget.selectedCategoryId != null
            ? ref.watch(productsByCategoryProvider(widget.selectedCategoryId!))
            : ref.watch(featuredProductsProvider);

    return SingleChildScrollView(
      child: Column(
        children: [
          // Search Bar
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                TextField(
                  controller: _searchController,
                  onChanged: widget.onSearchChanged,
                  decoration: InputDecoration(
                    hintText: 'Search products...',
                    prefixIcon: const Icon(Icons.search),
                    suffixIcon: _searchController.text.isNotEmpty
                        ? IconButton(
                            icon: const Icon(Icons.clear),
                            onPressed: () {
                              _searchController.clear();
                              widget.onSearchChanged('');
                            },
                          )
                        : null,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                ),
              ],
            ),
          ),
          // Featured Products or Products List
          productsAsync.when(
            loading: () => const Padding(
              padding: EdgeInsets.all(24),
              child: CircularProgressIndicator(),
            ),
            error: (error, stack) => Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                children: [
                  Icon(Icons.error_outline, size: 48, color: Colors.red[300]),
                  const SizedBox(height: 12),
                  Text('Error: $error'),
                ],
              ),
            ),
            data: (productsData) {
              // productsData is PaginatedResponse<Product> or List<Product>
              List<dynamic> products = [];
              
              try {
                if (productsData is List) {
                  // Featured products returns List<Product>
                  products = productsData.cast<dynamic>();
                } else {
                  // Search and category return PaginatedResponse<Product>
                  products = (productsData as dynamic).items as List<dynamic>;
                }
              } catch (e) {
                debugPrint('Error extracting products: $e');
              }

              if (products.isEmpty) {
                return Padding(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    children: [
                      Icon(Icons.shopping_bag_outlined, size: 48, color: Colors.grey[400]),
                      const SizedBox(height: 12),
                      const Text('No products found'),
                    ],
                  ),
                );
              }

              return GridView.builder(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  childAspectRatio: 0.7,
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                ),
                itemCount: products.length,
                itemBuilder: (context, index) => _ProductCard(product: products[index]),
              );
            },
          ),
          const SizedBox(height: 20),
        ],
      ),
    );
  }
}

class _ProductCard extends StatelessWidget {
  final dynamic product;

  const _ProductCard({required this.product});

  @override
  Widget build(BuildContext context) {
    // Handle both Product objects and Maps
    String name = 'Unknown';
    double price = 0.0;
    double rating = 0.0;
    int id = 0;
    
    if (product is Product) {
      name = product.name;
      price = product.price;
      rating = product.rating ?? 0.0;
      id = product.id;
    } else if (product is Map) {
      name = product['name'] ?? product['title'] ?? 'Unknown';
      
      final priceValue = product['price'];
      if (priceValue != null) {
        if (priceValue is String) {
          price = double.tryParse(priceValue) ?? 0.0;
        } else if (priceValue is num) {
          price = priceValue.toDouble();
        }
      }
      
      final ratingValue = product['rating'];
      if (ratingValue is String) {
        rating = double.tryParse(ratingValue) ?? 0.0;
      } else if (ratingValue is num) {
        rating = ratingValue.toDouble();
      }
      
      id = product['id'] ?? 0;
    }

    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      child: InkWell(
        onTap: () => Navigator.of(context).pushNamed('/product/$id'),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Product Image
            Expanded(
              child: Container(
                width: double.infinity,
                decoration: BoxDecoration(
                  borderRadius: const BorderRadius.only(
                    topLeft: Radius.circular(8),
                    topRight: Radius.circular(8),
                  ),
                  color: Colors.grey[200],
                ),
                child: _buildProductImage(product),
              ),
            ),
            // Product Info
            Padding(
              padding: const EdgeInsets.all(8),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    name,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Icon(Icons.star, size: 14, color: Colors.amber[600]),
                      const SizedBox(width: 4),
                      Text(
                        rating.toStringAsFixed(1),
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'Rs.${price.toStringAsFixed(2)}',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                      color: Theme.of(context).primaryColor,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildProductImage(dynamic product) {
    String? imageUrl;
    
    if (product is Product) {
      if (product.image != null) {
        imageUrl = product.image;
      } else if (product.images.isNotEmpty) {
        imageUrl = product.images.first;
      }
    } else if (product is Map) {
      imageUrl = product['image'];
      if (imageUrl == null) {
        final productImages = product['ProductImages'];
        if (productImages is List && productImages.isNotEmpty) {
          imageUrl = productImages.first['imageUrl'];
        }
      }
    }
    
    if (imageUrl != null && imageUrl.isNotEmpty) {
      // If it's a relative path, prepend the API host
      String fullImageUrl = imageUrl;
      if (!imageUrl.startsWith('http')) {
        fullImageUrl = 'https://artandcraft-platform-production.up.railway.app$imageUrl';
      }
      
      return ClipRRect(
        borderRadius: const BorderRadius.only(
          topLeft: Radius.circular(8),
          topRight: Radius.circular(8),
        ),
        child: Image.network(
          fullImageUrl,
          fit: BoxFit.cover,
          errorBuilder: (context, error, stackTrace) {
            return Center(
              child: Icon(Icons.image, size: 40, color: Colors.grey[400]),
            );
          },
          loadingBuilder: (context, child, loadingProgress) {
            if (loadingProgress == null) return child;
            return Center(
              child: CircularProgressIndicator(
                value: loadingProgress.expectedTotalBytes != null
                    ? loadingProgress.cumulativeBytesLoaded / loadingProgress.expectedTotalBytes!
                    : null,
              ),
            );
          },
        ),
      );
    }
    
    return Center(
      child: Icon(Icons.image, size: 40, color: Colors.grey[400]),
    );
  }
}

class _OrdersView extends ConsumerWidget {
  const _OrdersView();

  static const _orderParams = {
    'page': 1,
    'perPage': 20,
    'status': null,
  };

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    print('🔵 [_OrdersView.build] building');
    final ordersAsync = ref.watch(ordersProvider(_orderParams));

    return ordersAsync.when(
      loading: () {
        print('⏳ [_OrdersView.when] Loading state');
        return const Center(child: CircularProgressIndicator());
      },
      error: (error, stack) {
        print('❌ [_OrdersView.when] Error: $error');
        return Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.error_outline, size: 48, color: Colors.red[300]),
              const SizedBox(height: 12),
              Text('Error loading orders: $error'),
            ],
          ),
        );
      },
      data: (ordersData) {
        final orders = ordersData.items;
        print('✅ [_OrdersView.when] Data: ${orders.length} orders');

        if (orders.isEmpty) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.receipt_long, size: 64, color: Colors.grey[400]),
                const SizedBox(height: 12),
                const Text('No orders yet'),
              ],
            ),
          );
        }

        return ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: orders.length,
          itemBuilder: (context, index) {
            final order = orders[index];
            return _OrderCard(order: order);
          },
        );
      },
    );
  }
}

class _OrderCard extends StatelessWidget {
  final dynamic order;

  const _OrderCard({required this.order});

  @override
  Widget build(BuildContext context) {
    int orderId;
    String orderNumber;
    String status;
    dynamic totalAmount;
    String date;

    if (order is Order) {
      orderId = order.id;
      orderNumber = order.orderNumber;
      status = order.status;
      totalAmount = order.total;
      date = order.createdAt.toIso8601String();
    } else if (order is Map) {
      orderId = order['id'] ?? 0;
      orderNumber = order['orderNumber'] ?? 'Order #$orderId';
      status = order['status'] ?? 'pending';
      totalAmount = order['total'] ?? order['totalAmount'] ?? 0;
      date = order['createdAt'] ?? order['date'] ?? 'N/A';
    } else {
      orderId = 0;
      orderNumber = 'Order';
      status = 'pending';
      totalAmount = 0;
      date = 'N/A';
    }

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: () => Navigator.of(context).pushNamed('/order/$orderId'),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        orderNumber,
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(date, style: Theme.of(context).textTheme.bodySmall),
                    ],
                  ),
                  _buildStatusBadge(status, context),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Total Amount',
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                  Text(
                    '₹${(totalAmount is num ? totalAmount.toDouble() : double.parse(totalAmount.toString())).toStringAsFixed(2)}',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                      color: Theme.of(context).primaryColor,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatusBadge(String status, BuildContext context) {
    Color backgroundColor;
    Color textColor;
    String displayText;

    switch (status.toLowerCase()) {
      case 'pending':
        backgroundColor = Colors.orange[100]!;
        textColor = Colors.orange[900]!;
        displayText = 'Pending';
        break;
      case 'confirmed':
        backgroundColor = Colors.blue[100]!;
        textColor = Colors.blue[900]!;
        displayText = 'Confirmed';
        break;
      case 'shipped':
        backgroundColor = Colors.purple[100]!;
        textColor = Colors.purple[900]!;
        displayText = 'Shipped';
        break;
      case 'delivered':
        backgroundColor = Colors.green[100]!;
        textColor = Colors.green[900]!;
        displayText = 'Delivered';
        break;
      case 'cancelled':
        backgroundColor = Colors.red[100]!;
        textColor = Colors.red[900]!;
        displayText = 'Cancelled';
        break;
      default:
        backgroundColor = Colors.grey[200]!;
        textColor = Colors.grey[800]!;
        displayText = status;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        displayText,
        style: TextStyle(color: textColor, fontSize: 12, fontWeight: FontWeight.w600),
      ),
    );
  }
}


class _WishlistView extends ConsumerWidget {
  const _WishlistView();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final wishlistAsync = ref.watch(userWishlistProvider);

    return wishlistAsync.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (error, stack) => Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.error_outline, size: 48, color: Colors.red[300]),
            const SizedBox(height: 12),
            Text('Error loading wishlist: $error'),
          ],
        ),
      ),
      data: (wishlistData) {
        List wishlistItems = [];
        if (wishlistData is Map && wishlistData['items'] is List) {
          wishlistItems = wishlistData['items'];
        } else if (wishlistData is List) {
          wishlistItems = wishlistData;
        }

        if (wishlistItems.isEmpty) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.favorite_outline, size: 64, color: Colors.grey[400]),
                const SizedBox(height: 12),
                const Text('Your wishlist is empty'),
              ],
            ),
          );
        }

        return GridView.builder(
          padding: const EdgeInsets.all(16),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            childAspectRatio: 0.7,
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
          ),
          itemCount: wishlistItems.length,
          itemBuilder: (context, index) => _WishlistItemCard(item: wishlistItems[index]),
        );
      },
    );
  }
}

class _WishlistItemCard extends ConsumerWidget {
  final dynamic item;

  const _WishlistItemCard({required this.item});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    String name = item['name'] ?? item['title'] ?? 'Unknown';
    
    // Parse price - handle both string and numeric values
    double price = 0.0;
    final priceValue = item['price'];
    if (priceValue != null) {
      if (priceValue is String) {
        price = double.tryParse(priceValue) ?? 0.0;
      } else if (priceValue is num) {
        price = priceValue.toDouble();
      }
    }
    
    int productId = item['id'] ?? 0;

    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      child: Stack(
        children: [
          InkWell(
            onTap: () => Navigator.of(context).pushNamed('/product/$productId'),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Container(
                    width: double.infinity,
                    decoration: BoxDecoration(
                      borderRadius: const BorderRadius.only(
                        topLeft: Radius.circular(8),
                        topRight: Radius.circular(8),
                      ),
                      color: Colors.grey[200],
                    ),
                    child: Icon(Icons.image, size: 40, color: Colors.grey[400]),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(8),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        name,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '₹${price.toStringAsFixed(2)}',
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                          color: Theme.of(context).primaryColor,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          Positioned(
            top: 8,
            right: 8,
            child: IconButton(
              icon: const Icon(Icons.favorite, color: Colors.red),
              onPressed: () {
                ref.read(removeFromWishlistProvider.notifier).removeFromWishlist(productId);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Removed from wishlist')),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
