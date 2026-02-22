// Register Screen
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/auth_provider.dart';
import 'otp_verification_screen.dart';

class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen> {
  late TextEditingController _nameController;
  late TextEditingController _emailController;
  late TextEditingController _passwordController;
  late TextEditingController _confirmPasswordController;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController();
    _emailController = TextEditingController();
    _passwordController = TextEditingController();
    _confirmPasswordController = TextEditingController();
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  bool _showOtpScreen = false;
  String? _pendingEmail;
  bool _otpLoading = false;
  String? _otpError;

  void _clearError() {
    final authNotifier = ref.read(authProvider.notifier);
    authNotifier.state = authNotifier.state.copyWith(error: null);
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final authNotifier = ref.read(authProvider.notifier);

    ref.listen(authProvider, (previous, next) {
      debugPrint('authProvider state changed: error=${next.error}, isAuthenticated=${next.isAuthenticated}');
      if (next.error != null && next.error!.isNotEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(next.error!),
            backgroundColor: Colors.red,
          ),
        );
      }
      // Only navigate to home if authenticated and not in OTP flow
      if (next.isAuthenticated && mounted && !_showOtpScreen) {
        Navigator.of(context).pushReplacementNamed('/home');
      }
    });

    if (_showOtpScreen && _pendingEmail != null) {
      return OtpVerificationScreen(
        email: _pendingEmail!,
        isLoading: _otpLoading,
        error: _otpError,
        onSubmit: (code) async {
          setState(() {
            _otpLoading = true;
            _otpError = null;
          });
          try {
            await authNotifier.verifyEmail(
              email: _pendingEmail!,
              code: code,
            );
            final state = ref.read(authProvider);
            if (state.error == null) {
              if (mounted) {
                Navigator.of(context).pushReplacementNamed('/login');
              }
            } else {
              setState(() {
                _otpError = state.error;
              });
            }
          } catch (e) {
            setState(() {
              _otpError = e.toString();
            });
          } finally {
            setState(() {
              _otpLoading = false;
            });
          }
        },
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Create Account'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            children: [
              TextField(
                controller: _nameController,
                decoration: InputDecoration(
                  hintText: 'Full Name',
                  prefixIcon: const Icon(Icons.person_outlined),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _emailController,
                decoration: InputDecoration(
                  hintText: 'Email',
                  prefixIcon: const Icon(Icons.email_outlined),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                keyboardType: TextInputType.emailAddress,
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _passwordController,
                decoration: InputDecoration(
                  hintText: 'Password',
                  prefixIcon: const Icon(Icons.lock_outlined),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                obscureText: true,
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _confirmPasswordController,
                decoration: InputDecoration(
                  hintText: 'Confirm Password',
                  prefixIcon: const Icon(Icons.lock_outlined),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                obscureText: true,
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: authState.isLoading
                      ? null
                      : () async {
                          if (_passwordController.text !=
                              _confirmPasswordController.text) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('Passwords do not match'),
                              ),
                            );
                            return;
                          }
                          _clearError();
                          debugPrint('Attempting registration for email: "+_emailController.text+"');
                          await authNotifier.register(
                            name: _nameController.text,
                            email: _emailController.text,
                            password: _passwordController.text,
                          );
                          final state = ref.read(authProvider);
                          debugPrint('Registration result: error={state.error}, message={state.message}');
                          if (state.error == null) {
                            setState(() {
                              _showOtpScreen = true;
                              _pendingEmail = _emailController.text;
                            });
                          }
                        },
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                  child: authState.isLoading
                      ? const CircularProgressIndicator()
                      : const Text('Register'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
