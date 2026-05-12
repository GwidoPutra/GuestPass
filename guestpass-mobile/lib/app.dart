import 'package:flutter/material.dart';
import 'package:guestpass_mobile/config/routes.dart';
import 'package:guestpass_mobile/config/theme.dart';

/// Root widget aplikasi GuestPass
class App extends StatelessWidget {
  const App({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'GuestPass',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      routerConfig: AppRoutes.router,
    );
  }
}
