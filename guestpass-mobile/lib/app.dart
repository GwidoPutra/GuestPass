import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:guestpass_mobile/config/routes.dart';
import 'package:guestpass_mobile/config/theme.dart';
import 'package:guestpass_mobile/logic/auth/auth_cubit.dart';

/// Root widget aplikasi GuestPass
class App extends StatelessWidget {
  const App({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => AuthCubit()..checkAuthStatus(),
      child: MaterialApp.router(
        title: 'GuestPass',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.lightTheme,
        routerConfig: AppRoutes.router,
      ),
    );
  }
}
