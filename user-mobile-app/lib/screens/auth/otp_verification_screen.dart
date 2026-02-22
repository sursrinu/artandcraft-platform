import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/auth_provider.dart';
import 'dart:async';

class OtpVerificationScreen extends ConsumerStatefulWidget {
  final String email;
  final void Function(String code) onSubmit;
  final bool isLoading;
  final String? error;
    final int otpExpirySeconds;

  const OtpVerificationScreen({
    Key? key,
    required this.email,
    required this.onSubmit,
    this.isLoading = false,
    this.error,
      this.otpExpirySeconds = 60, // default 1 min
  }) : super(key: key);

  @override
  ConsumerState<OtpVerificationScreen> createState() => _OtpVerificationScreenState();
}

class _OtpVerificationScreenState extends ConsumerState<OtpVerificationScreen> {
  final TextEditingController _otpController = TextEditingController();
  String? _localError;
  late int _secondsLeft;
  Timer? _timer;
  String? _resendMessage;
  bool _resending = false;

  @override
  void initState() {
    super.initState();
    _secondsLeft = widget.otpExpirySeconds;
    _startTimer();
    _otpController.addListener(() {
      if (_localError != null) {
        setState(() {
          _localError = null;
        });
      }
    });
  }

  void _startTimer() {
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_secondsLeft > 0) {
        setState(() {
          _secondsLeft--;
        });
      } else {
        timer.cancel();
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    _otpController.dispose();
    super.dispose();
  }

  Future<void> _resendOtp() async {
    setState(() {
      _resending = true;
      _resendMessage = null;
      _localError = null;
    });
    try {
      await ref.read(authProvider.notifier).resendVerificationCode(email: widget.email);
      final authState = ref.read(authProvider);
      setState(() {
        _resendMessage = authState.message ?? 'OTP resent. Please check your email.';
        _secondsLeft = widget.otpExpirySeconds;
      });
      _startTimer();
    } catch (e) {
      setState(() {
        _resendMessage = e.toString();
      });
    } finally {
      setState(() {
        _resending = false;
      });
    }
  }


  @override
  Widget build(BuildContext context) {
    String timerText = _secondsLeft > 0
        ? 'OTP expires in ${(_secondsLeft ~/ 60).toString().padLeft(2, '0')}:${(_secondsLeft % 60).toString().padLeft(2, '0')}'
        : 'OTP expired';
    Color timerColor;
    if (_secondsLeft == 0) {
      timerColor = Colors.red;
    } else if (_secondsLeft < 120) {
      timerColor = Colors.red;
    } else {
      timerColor = Colors.green;
    }
    return Scaffold(
      appBar: AppBar(title: const Text('Verify Email')),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text('An OTP has been sent to ${widget.email}'),
            const SizedBox(height: 16),
            Text(timerText, style: TextStyle(color: timerColor)),
            const SizedBox(height: 24),
            TextField(
              controller: _otpController,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                labelText: 'Enter OTP',
                border: OutlineInputBorder(),
              ),
              onChanged: (_) {
                if (_localError != null) {
                  setState(() {
                    _localError = null;
                  });
                }
              },
            ),
            const SizedBox(height: 24),
            if ((_localError ?? widget.error) != null && (_localError ?? widget.error)!.isNotEmpty)
              Text(_localError ?? widget.error!, style: const TextStyle(color: Colors.red)),
            if (_resendMessage != null)
              Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: Text(_resendMessage!, style: TextStyle(color: _resendMessage!.toLowerCase().contains('error') ? Colors.red : Colors.green)),
              ),
            Row(
              children: [
                Expanded(
                  child: ElevatedButton(
                    onPressed: widget.isLoading || _secondsLeft == 0
                        ? null
                        : () => widget.onSubmit(_otpController.text.trim()),
                    child: widget.isLoading
                        ? const CircularProgressIndicator()
                        : const Text('Verify'),
                  ),
                ),
                const SizedBox(width: 12),
                OutlinedButton(
                  onPressed: _resending || _secondsLeft > 0 ? null : _resendOtp,
                  child: _resending ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2)) : const Text('Resend OTP'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
