import 'package:go_router/go_router.dart';
import 'package:guestpass_mobile/presentation/screens/auth/login_screen.dart';
import 'package:guestpass_mobile/presentation/screens/auth/register_screen.dart';
import 'package:guestpass_mobile/presentation/screens/dashboard/main_shell.dart';

/// Konfigurasi routing aplikasi menggunakan GoRouter
class AppRoutes {
  static final GoRouter router = GoRouter(
    initialLocation: '/login',
    routes: [
      GoRoute(
        path: '/login',
        name: 'login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/register',
        name: 'register',
        builder: (context, state) => const RegisterScreen(),
      ),
      GoRoute(
        path: '/main',
        name: 'main',
        builder: (context, state) => const MainShell(),
      ),
    ],
  );
}
