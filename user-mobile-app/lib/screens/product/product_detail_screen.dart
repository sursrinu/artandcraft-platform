import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/product_provider.dart';
import '../../providers/review_provider.dart';
import '../../providers/user_provider.dart';
import '../../providers/cart_provider_new.dart';
import '../../services/product_service.dart';

class ProductDetailScreen extends ConsumerStatefulWidget {
  final int productId;

  const ProductDetailScreen({
    Key? key,
    required this.productId,
  }) : super(key: key);

  @override
  ConsumerState<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends ConsumerState<ProductDetailScreen> {
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
  int _quantity = 1;
  int _currentImageIndex = 0;

  // Helper methods to safely access product data
  String _getProductName(dynamic productData) {
    if (productData is Product) {
      return productData.name;
    } else if (productData is Map) {
      return productData['name'] ?? 'Unknown Product';
    }
    return 'Unknown Product';
  }

  String _getProductRating(dynamic productData) {
    if (productData is Product) {
      return (productData.rating ?? 0).toString();
    } else if (productData is Map) {
      return (productData['rating'] ?? 0).toString();
    }
    return '0';
  }

  int _getReviewCount(dynamic productData) {
    if (productData is Product) {
      return productData.reviewCount ?? 0;
    } else if (productData is Map) {
      return productData['reviewCount'] ?? 0;
    }
    return 0;
  }

  String _getProductPrice(dynamic productData) {
    if (productData is Product) {
      return productData.price.toStringAsFixed(2);
    } else if (productData is Map) {
      final priceValue = productData['price'];
      if (priceValue is String) {
        return priceValue;
      } else if (priceValue is num) {
        return priceValue.toDouble().toStringAsFixed(2);
      }
      return '0.00';
    }
    return '0.00';
  }

  String _getProductDescription(dynamic productData) {
    if (productData is Product) {
      return productData.description;
    } else if (productData is Map) {
      return productData['description'] ?? 'No description available';
    }
    return 'No description available';
  }

  @override
  Widget build(BuildContext context) {
    final productAsync = ref.watch(productByIdProvider(widget.productId));
    final reviewsAsync = ref.watch(productReviewsProvider({
      'productId': widget.productId,
      'page': 1,
      'perPage': 5,
    }));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Product Details'),
        elevation: 1,
      ),
      body: productAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.error_outline, size: 48, color: Colors.red[300]),
              const SizedBox(height: 12),
              Text('Error: $error'),
            ],
          ),
        ),
        data: (productData) => SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Product Image
              Container(
                width: double.infinity,
                height: 200,
                color: Colors.grey[200],
                child: _buildProductImage(productData),
              ),
              Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Product Name and Price
                    Text(
                      _getProductName(productData),
                      style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Icon(Icons.star, size: 20, color: Colors.amber[600]),
                        const SizedBox(width: 4),
                        Text(
                          _getProductRating(productData),
                          style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          '(${_getReviewCount(productData)} reviews)',
                          style: Theme.of(context).textTheme.bodySmall,
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'Rs.${_getProductPrice(productData)}',
                      style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: Theme.of(context).primaryColor,
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Product Description
                    Text(
                      'Description',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      _getProductDescription(productData),
                      style: Theme.of(context).textTheme.bodyMedium,
                    ),
                    const SizedBox(height: 24),

                    // Quantity Selector and Add to Cart
                    Row(
                      children: [
                        Container(
                          decoration: BoxDecoration(
                            border: Border.all(color: Colors.grey[300]!),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Row(
                            children: [
                              IconButton(
                                icon: const Icon(Icons.remove, size: 20),
                                onPressed: _quantity > 1
                                    ? () => setState(() => _quantity--)
                                    : null,
                              ),
                              Text(
                                _quantity.toString(),
                                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              IconButton(
                                icon: const Icon(Icons.add, size: 20),
                                onPressed: () => setState(() => _quantity++),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: ElevatedButton.icon(
                            onPressed: _addToCart,
                            icon: const Icon(Icons.shopping_cart_outlined),
                            label: const Text('Add to Cart'),
                          ),
                        ),
                        const SizedBox(width: 8),
                        IconButton(
                          icon: const Icon(Icons.favorite_outline),
                          onPressed: _addToWishlist,
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),

                    // Similar Products
                    _buildSimilarProducts(),
                    const SizedBox(height: 24),

                    // Reviews Section
                    Text(
                      'Customer Reviews',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 12),
                    _buildReviewsSection(reviewsAsync),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSimilarProducts() {
    final similarAsync = ref.watch(similarProductsProvider(widget.productId));

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Similar Products',
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 12),
        similarAsync.when(
          loading: () => const SizedBox(
            height: 180,
            child: Center(child: CircularProgressIndicator()),
          ),
          error: (_, __) => const SizedBox.shrink(),
          data: (similarData) {
            List<dynamic> similar = [];
            
            // similarData is List<Product> from the provider
            if (similarData is List) {
              similar = similarData.cast<dynamic>();
            } else if (similarData is Map<String, dynamic>) {
              // Handle Map response with items key
              final itemsValue = (similarData as Map<String, dynamic>)['items'];
              if (itemsValue is List) {
                similar = itemsValue.cast<dynamic>();
              }
            }

            if (similar.isEmpty) return const SizedBox.shrink();

            return SizedBox(
              height: 180,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                itemCount: similar.length,
                itemBuilder: (context, index) => _buildSimilarProductCard(similar[index]),
              ),
            );
          },
        ),
      ],
    );
  }

  Widget _buildSimilarProductCard(dynamic product) {
    // Handle both Product objects and Maps
    int productId = 0;
    String name = 'Unknown';
    double price = 0.0;
    
    if (product is Map) {
      productId = product['id'] ?? 0;
      name = product['name'] ?? 'Unknown';
      // Parse price - it comes as a string from the API
      final priceValue = product['price'];
      if (priceValue != null) {
        if (priceValue is String) {
          price = double.tryParse(priceValue) ?? 0.0;
        } else if (priceValue is num) {
          price = priceValue.toDouble();
        }
      }
    } else {
      // Product object
      try {
        productId = (product as dynamic).id ?? 0;
        name = (product as dynamic).name ?? 'Unknown';
        final priceValue = (product as dynamic).price;
        if (priceValue != null) {
          if (priceValue is String) {
            price = double.tryParse(priceValue) ?? 0.0;
          } else if (priceValue is num) {
            price = priceValue.toDouble();
          }
        }
      } catch (e) {
        // Use defaults if error
      }
    }

    return Card(
      margin: const EdgeInsets.only(right: 12),
      child: InkWell(
        onTap: () {
          Navigator.of(context).pushReplacement(
            MaterialPageRoute(
              builder: (_) => ProductDetailScreen(productId: productId),
            ),
          );
        },
        child: Padding(
          padding: const EdgeInsets.all(8),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              SizedBox(
                width: 120,
                height: 80,
                child: Container(
                  color: Colors.grey[200],
                  child: _buildSimilarProductImage(product),
                ),
              ),
              const SizedBox(height: 8),
              SizedBox(
                width: 120,
                child: Text(
                  name,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 12),
                ),
              ),
              const SizedBox(height: 4),
              Text(
                'Rs.${price.toStringAsFixed(2)}',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  color: Theme.of(context).primaryColor,
                  fontSize: 12,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildReviewsSection(AsyncValue reviewsAsync) {
    return reviewsAsync.when(
      loading: () => const CircularProgressIndicator(),
      error: (error, _) => Text('Error loading reviews: $error'),
      data: (reviewsData) {
        List reviews = [];
        if (reviewsData is Map && reviewsData['items'] is List) {
          reviews = reviewsData['items'];
        } else if (reviewsData is List) {
          reviews = reviewsData;
        }

        return Column(
          children: [
            if (reviews.isEmpty)
              Text(
                'No reviews yet',
                style: Theme.of(context).textTheme.bodyMedium,
              )
            else
              ...reviews.asMap().entries.map((entry) {
                final review = entry.value;
                return _buildReviewCard(review);
              }),
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  Navigator.of(context).pushNamed(
                    '/product/${widget.productId}/reviews',
                  );
                },
                child: const Text('View All Reviews'),
              ),
            ),
          ],
        );
      },
    );
  }

  Widget _buildReviewCard(dynamic review) {
    String userName = review['user']?['name'] ?? review['userName'] ?? 'Anonymous';
    int rating = (review['rating'] as num?)?.toInt() ?? 0;
    String content = review['content'] ?? review['text'] ?? '';
    String date = review['createdAt'] ?? review['date'] ?? 'N/A';

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  userName,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
                Row(
                  children: List.generate(5, (index) {
                    return Icon(
                      index < rating ? Icons.star : Icons.star_outline,
                      size: 14,
                      color: Colors.amber[600],
                    );
                  }),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              content,
              maxLines: 3,
              overflow: TextOverflow.ellipsis,
              style: Theme.of(context).textTheme.bodySmall,
            ),
            const SizedBox(height: 8),
            Text(
              date,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: Colors.grey[500],
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _addToCart() {
    ref.read(addToCartProvider((
      widget.productId,
      _quantity,
    )).future).then((_) {
      // Invalidate cart provider to refresh the cart
      ref.invalidate(cartProvider);
      
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Added to cart'),
          duration: Duration(seconds: 2),
          backgroundColor: Colors.green,
        ),
      );
    }).catchError((error) {
      String errorMessage = error.toString();
      
      // Parse specific error messages from backend
      if (errorMessage.contains('Insufficient stock')) {
        errorMessage = 'Quantity selected not available';
      } else if (errorMessage.contains('Product not found')) {
        errorMessage = 'Product not found';
      }
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(errorMessage),
          duration: const Duration(seconds: 3),
          backgroundColor: Colors.red,
        ),
      );
    });
  }

  void _addToWishlist() {
    ref.read(addToWishlistProvider.notifier).addToWishlist(widget.productId).then((_) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Added to wishlist'),
          duration: Duration(seconds: 2),
        ),
      );
    }).catchError((error) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $error')),
      );
    });
  }

  Widget _buildProductImage(dynamic productData) {
    List<String> imageUrls = [];
    
    if (productData is Product) {
      if (productData.image != null && productData.image!.isNotEmpty) {
        imageUrls.add(productData.image!);
      }
      if (productData.images.isNotEmpty) {
        imageUrls.addAll(productData.images);
      }
    } else if (productData is Map) {
      final image = productData['image'];
      if (image != null && (image as String).isNotEmpty) {
        imageUrls.add(image);
      }
      final productImages = productData['ProductImages'];
      if (productImages is List && productImages.isNotEmpty) {
        for (var img in productImages) {
          final imageUrl = img['imageUrl'];
          if (imageUrl != null && (imageUrl as String).isNotEmpty) {
            imageUrls.add(imageUrl);
          }
        }
      }
    }

    // Remove duplicates while preserving order
    final uniqueImageUrls = <String>[];
    for (var url in imageUrls) {
      if (!uniqueImageUrls.contains(url)) {
        uniqueImageUrls.add(url);
      }
    }

    if (uniqueImageUrls.isEmpty) {
      return Center(
        child: Icon(Icons.image, size: 80, color: Colors.grey[400]),
      );
    }

    // If only one image, show it without carousel
    if (uniqueImageUrls.length == 1) {
      return _buildImageWidget(uniqueImageUrls[0]);
    }

    // Multiple images - show image slider with indicators
    return Stack(
      children: [
        PageView(
          onPageChanged: (index) {
            setState(() {
              _currentImageIndex = index;
            });
          },
          children: uniqueImageUrls.map((imageUrl) {
            return _buildImageWidget(imageUrl);
          }).toList(),
        ),
        // Image indicators
        Positioned(
          bottom: 8,
          left: 0,
          right: 0,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: List.generate(
              uniqueImageUrls.length,
              (index) => Container(
                width: 8,
                height: 8,
                margin: const EdgeInsets.symmetric(horizontal: 4),
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: _currentImageIndex == index
                      ? Colors.white
                      : Colors.white.withOpacity(0.5),
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildImageWidget(String imageUrl) {
    String fullImageUrl = imageUrl;
    if (!imageUrl.startsWith('http')) {
      fullImageUrl = 'https://artandcraft-platform-production.up.railway.app$imageUrl';
    }

    return ClipRRect(
      borderRadius: BorderRadius.circular(8),
      child: Image.network(
        fullImageUrl,
        fit: BoxFit.cover,
        errorBuilder: (context, error, stackTrace) {
          return Center(
            child: Icon(Icons.image, size: 80, color: Colors.grey[400]),
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

  Widget _buildSimilarProductImage(dynamic product) {
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
      String fullImageUrl = imageUrl;
      if (!imageUrl.startsWith('http')) {
        fullImageUrl = 'https://artandcraft-platform-production.up.railway.app$imageUrl';
      }
      
      return ClipRRect(
        child: Image.network(
          fullImageUrl,
          fit: BoxFit.cover,
          errorBuilder: (context, error, stackTrace) {
            return Center(
              child: Icon(Icons.image, size: 40, color: Colors.grey[400]),
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
