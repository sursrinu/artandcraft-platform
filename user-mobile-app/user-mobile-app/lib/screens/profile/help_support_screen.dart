// Help & Support Screen
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class HelpSupportScreen extends ConsumerWidget {
  const HelpSupportScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Help & Support'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Contact Information
            Text(
              'Contact Us',
              style: Theme.of(context)
                  .textTheme
                  .titleLarge
                  ?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            _ContactTile(
              icon: Icons.email,
              title: 'Email',
              subtitle: 'support@artandcraft.com',
              onTap: () {
                // Open email client
              },
            ),
            _ContactTile(
              icon: Icons.phone,
              title: 'Phone',
              subtitle: '+1 (555) 123-4567',
              onTap: () {
                // Open phone dialer
              },
            ),
            _ContactTile(
              icon: Icons.location_on,
              title: 'Address',
              subtitle: '123 Art Street, Craft City, CC 12345',
              onTap: () {
                // Open maps
              },
            ),
            const SizedBox(height: 32),
            // FAQs
            Text(
              'Frequently Asked Questions',
              style: Theme.of(context)
                  .textTheme
                  .titleLarge
                  ?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            _FAQTile(
              question: 'How do I track my order?',
              answer:
                  'You can track your order in the Orders section of your profile. Enter your order number to see real-time updates.',
            ),
            _FAQTile(
              question: 'What is your return policy?',
              answer:
                  'We accept returns within 30 days of purchase. The item must be unused and in original packaging.',
            ),
            _FAQTile(
              question: 'How long does delivery take?',
              answer:
                  'Standard delivery takes 5-7 business days. Express delivery is available for 2-3 business days.',
            ),
            _FAQTile(
              question: 'Do you offer international shipping?',
              answer:
                  'Yes, we ship to selected countries. Shipping costs and delivery times vary by location.',
            ),
            const SizedBox(height: 32),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: () {
                  // Open support form or chat
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Opening support form...'),
                    ),
                  );
                },
                icon: const Icon(Icons.chat),
                label: const Text('Start a Chat'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ContactTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  const _ContactTile({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Icon(icon),
      title: Text(title),
      subtitle: Text(subtitle),
      onTap: onTap,
    );
  }
}

class _FAQTile extends StatefulWidget {
  final String question;
  final String answer;

  const _FAQTile({
    required this.question,
    required this.answer,
  });

  @override
  State<_FAQTile> createState() => _FAQTileState();
}

class _FAQTileState extends State<_FAQTile> {
  bool _isExpanded = false;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Column(
        children: [
          ListTile(
            title: Text(widget.question),
            trailing: Icon(
              _isExpanded ? Icons.expand_less : Icons.expand_more,
            ),
            onTap: () {
              setState(() {
                _isExpanded = !_isExpanded;
              });
            },
          ),
          if (_isExpanded)
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
              child: Text(
                widget.answer,
                style: Theme.of(context).textTheme.bodyMedium,
              ),
            ),
        ],
      ),
    );
  }
}
