// Edit Address Screen
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/user_provider.dart';

class EditAddressScreen extends ConsumerStatefulWidget {
  final int addressId;

  const EditAddressScreen({
    Key? key,
    required this.addressId,
  }) : super(key: key);

  @override
  ConsumerState<EditAddressScreen> createState() => _EditAddressScreenState();
}

class _EditAddressScreenState extends ConsumerState<EditAddressScreen> {
  late TextEditingController _nameController;
  late TextEditingController _phoneController;
  late TextEditingController _streetController;
  late TextEditingController _cityController;
  late TextEditingController _stateController;
  late TextEditingController _zipCodeController;
  late TextEditingController _countryController;
  late String _selectedType;
  late bool _isDefault;
  bool _isInitialized = false;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController();
    _phoneController = TextEditingController();
    _streetController = TextEditingController();
    _cityController = TextEditingController();
    _stateController = TextEditingController();
    _zipCodeController = TextEditingController();
    _countryController = TextEditingController(text: 'India');
    _selectedType = 'Home';
    _isDefault = false;
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _streetController.dispose();
    _cityController.dispose();
    _stateController.dispose();
    _zipCodeController.dispose();
    _countryController.dispose();
    super.dispose();
  }

  void _populateControllers(dynamic address) {
    if (!_isInitialized && address != null) {
      _nameController.text = address.fullName ?? '';
      _phoneController.text = address.phoneNumber ?? '';
      _streetController.text = address.street ?? '';
      _cityController.text = address.city ?? '';
      _stateController.text = address.state ?? '';
      _zipCodeController.text = address.zipCode ?? '';
      _countryController.text = address.country ?? 'India';
      _selectedType = address.type ?? 'Home';
      _isDefault = address.isDefault ?? false;
      _isInitialized = true;
    }
  }

  @override
  Widget build(BuildContext context) {
    final addresses = ref.watch(userAddressesProvider);

    // Listen to update results
    ref.listen(updateAddressProvider, (prev, next) {
      next.when(
        data: (data) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Address updated successfully'),
              backgroundColor: Colors.green,
            ),
          );
          Future.delayed(const Duration(seconds: 1), () {
            if (context.mounted) Navigator.of(context).pop();
          });
        },
        error: (error, stackTrace) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Error: $error'),
              backgroundColor: Colors.red,
            ),
          );
        },
        loading: () {},
      );
    });

    return addresses.when(
      loading: () => Scaffold(
        appBar: AppBar(title: const Text('Edit Address')),
        body: const Center(child: CircularProgressIndicator()),
      ),
      error: (error, stackTrace) => Scaffold(
        appBar: AppBar(title: const Text('Edit Address')),
        body: Center(child: Text('Error: $error')),
      ),
      data: (addressList) {
        // Find the address with matching ID
        dynamic address;
        try {
          // Cast to ensure proper typing
          final List<dynamic> addresses = addressList ?? [];
          address = addresses.firstWhere((a) => a.id == widget.addressId);
        } catch (e) {
          return Scaffold(
            appBar: AppBar(title: const Text('Edit Address')),
            body: const Center(child: Text('Address not found')),
          );
        }

        // Populate controllers
        _populateControllers(address);

        return Scaffold(
          appBar: AppBar(
            title: const Text('Edit Address'),
          ),
          body: SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                TextField(
                  controller: _nameController,
                  decoration: InputDecoration(
                    labelText: 'Full Name',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: _phoneController,
                  decoration: InputDecoration(
                    labelText: 'Phone Number',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  keyboardType: TextInputType.phone,
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: _streetController,
                  decoration: InputDecoration(
                    labelText: 'Street Address',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  maxLines: 2,
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _cityController,
                        decoration: InputDecoration(
                          labelText: 'City',
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: TextField(
                        controller: _stateController,
                        decoration: InputDecoration(
                          labelText: 'State',
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _zipCodeController,
                        decoration: InputDecoration(
                          labelText: 'ZIP Code',
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: TextField(
                        controller: _countryController,
                        decoration: InputDecoration(
                          labelText: 'Country',
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                DropdownButtonFormField<String>(
                  value: _selectedType,
                  decoration: InputDecoration(
                    labelText: 'Address Type',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  items: ['Home', 'Work', 'Other'].map((type) {
                    return DropdownMenuItem(
                      value: type,
                      child: Text(type),
                    );
                  }).toList(),
                  onChanged: (value) {
                    setState(() {
                      _selectedType = value ?? 'Home';
                    });
                  },
                ),
                const SizedBox(height: 16),
                CheckboxListTile(
                  title: const Text('Set as default address'),
                  value: _isDefault,
                  onChanged: (value) {
                    setState(() {
                      _isDefault = value ?? false;
                    });
                  },
                ),
                const SizedBox(height: 32),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () async {
                      final updateAddressNotifier =
                          ref.read(updateAddressProvider.notifier);
                      await updateAddressNotifier.updateAddress(
                        addressId: widget.addressId,
                        fullName: _nameController.text,
                        phoneNumber: _phoneController.text,
                        street: _streetController.text,
                        city: _cityController.text,
                        stateOrProvince: _stateController.text,
                        zipCode: _zipCodeController.text,
                        country: _countryController.text,
                        type: _selectedType,
                        isDefault: _isDefault,
                      );
                    },
                    child: const Text('Save Changes'),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
