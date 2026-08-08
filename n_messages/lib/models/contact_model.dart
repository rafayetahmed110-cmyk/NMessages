class ContactModel {
  final String id;
  final String name;
  final String phoneNumber;
  final String? avatarUrl;

  ContactModel({
    required this.id,
    required this.name,
    required this.phoneNumber,
    this.avatarUrl,
  });

  String get initials {
    if (name.isEmpty) return '?';
    final parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    }
    return name[0].toUpperCase();
  }

  factory ContactModel.fromMap(Map<dynamic, dynamic> map) {
    return ContactModel(
      id: (map['id'] as String?) ?? (map['phoneNumber'] as String? ?? ''),
      name: (map['name'] as String?) ?? 'Unknown Contact',
      phoneNumber: (map['phoneNumber'] as String?) ?? '',
      avatarUrl: map['avatarUrl'] as String?,
    );
  }
}
