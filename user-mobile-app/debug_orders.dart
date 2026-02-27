// Debug script to test the orders API response parsing
void main() {
  // Simulate the API response
  final apiResponse = {
    'success': true,
    'data': {
      'orders': [],
      'pagination': {
        'page': 1,
        'perPage': 20,
        'total': 0,
        'pages': 0
      }
    }
  };

  // Extract data like the service does
  final dataObj = apiResponse['data'] as Map<String, dynamic>;
  print('Data object: $dataObj');
  print('Data object keys: ${dataObj.keys}');

  // Check what PaginatedResponse.fromJson expects
  final itemsList = dataObj['data'] ??
      dataObj['items'] ??
      dataObj['products'] ??
      dataObj['orders'] ??
      [];
  print('Items list: $itemsList');
  print('Items list length: ${(itemsList as List).length}');

  // Check pagination
  final paginationData = dataObj['pagination'] ?? {};
  print('Pagination data: $paginationData');
}
