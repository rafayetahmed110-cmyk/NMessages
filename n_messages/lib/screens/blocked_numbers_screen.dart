import 'package:flutter/material.dart';
import '../services/blocked_numbers_service.dart';
import '../l10n/app_localizations.dart';

class BlockedNumbersScreen extends StatefulWidget {
  final String lang;
  const BlockedNumbersScreen({super.key, required this.lang});

  @override
  State<BlockedNumbersScreen> createState() => _BlockedNumbersScreenState();
}

class _BlockedNumbersScreenState extends State<BlockedNumbersScreen> {
  final TextEditingController _numberController = TextEditingController();
  List<String> _blockedNumbers = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadBlocked();
  }

  Future<void> _loadBlocked() async {
    final list = await BlockedNumbersService.getBlockedNumbers();
    setState(() {
      _blockedNumbers = list;
      _isLoading = false;
    });
  }

  Future<void> _addNumber() async {
    final num = _numberController.text.trim();
    if (num.isEmpty) return;
    await BlockedNumbersService.addBlockedNumber(num);
    _numberController.clear();
    _loadBlocked();
  }

  Future<void> _removeNumber(String num) async {
    await BlockedNumbersService.removeBlockedNumber(num);
    _loadBlocked();
  }

  @override
  Widget build(BuildContext context) {
    final loc = AppLocalizations(widget.lang);

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0F172A),
        title: Text(loc.translate('blocked_numbers'), style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _numberController,
                    style: const TextStyle(color: Colors.white),
                    keyboardType: TextInputType.phone,
                    decoration: InputDecoration(
                      hintText: 'Enter phone number to block...',
                      hintStyle: const TextStyle(color: Color(0xFF94A3B8)),
                      filled: true,
                      fillColor: const Color(0xFF1E293B),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide.none,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                ElevatedButton(
                  onPressed: _addNumber,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.redAccent,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                  ),
                  child: const Text('Block', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                ),
              ],
            ),
          ),
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator(color: Colors.indigoAccent))
                : _blockedNumbers.isEmpty
                    ? const Center(child: Text('No blocked numbers', style: TextStyle(color: Color(0xFF94A3B8))))
                    : ListView.builder(
                        itemCount: _blockedNumbers.length,
                        itemBuilder: (context, index) {
                          final number = _blockedNumbers[index];
                          return Card(
                            color: const Color(0xFF1E293B),
                            margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                            child: ListTile(
                              leading: const Icon(Icons.block, color: Colors.redAccent),
                              title: Text(number, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                              trailing: TextButton(
                                onPressed: () => _removeNumber(number),
                                child: Text(loc.translate('unblock'), style: const TextStyle(color: Colors.indigoAccent)),
                              ),
                            ),
                          );
                        },
                      ),
          ),
        ],
      ),
    );
  }
}
