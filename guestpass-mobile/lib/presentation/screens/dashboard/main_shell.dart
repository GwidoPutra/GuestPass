import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:guestpass_mobile/config/theme.dart';
import 'package:guestpass_mobile/logic/auth/auth_cubit.dart';
import 'package:guestpass_mobile/logic/auth/auth_state.dart';
import 'package:guestpass_mobile/presentation/screens/dashboard/dashboard_screen.dart';
import 'package:guestpass_mobile/presentation/screens/events/event_list_screen.dart';
import 'package:guestpass_mobile/presentation/screens/scanner/scanner_screen.dart';
import 'package:guestpass_mobile/presentation/screens/committees/committee_list_screen.dart';

/// Shell utama dengan Bottom Navigation Bar (4 tab)
class MainShell extends StatefulWidget {
  const MainShell({super.key});

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  int _currentIndex = 0;

  final List<Widget> _screens = [
    const DashboardScreen(),
    const EventListScreen(),
    const ScannerScreen(),
    const CommitteeListScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return BlocListener<AuthCubit, AuthState>(
      listener: (context, state) {
        if (state is AuthUnauthenticated) {
          context.go('/login');
        }
      },
      child: Scaffold(
        body: IndexedStack(
          index: _currentIndex,
          children: _screens,
        ),
        bottomNavigationBar: Container(
          decoration: const BoxDecoration(
            border: Border(
              top: BorderSide(color: AppColors.border, width: 1),
            ),
          ),
          child: BottomNavigationBar(
            currentIndex: _currentIndex,
            onTap: (index) => setState(() => _currentIndex = index),
            items: const [
              BottomNavigationBarItem(
                icon: Icon(Icons.dashboard_outlined),
                activeIcon: Icon(Icons.dashboard),
                label: 'Ringkasan',
              ),
              BottomNavigationBarItem(
                icon: Icon(Icons.event_outlined),
                activeIcon: Icon(Icons.event),
                label: 'Event',
              ),
              BottomNavigationBarItem(
                icon: Icon(Icons.qr_code_scanner_outlined),
                activeIcon: Icon(Icons.qr_code_scanner),
                label: 'Scanner',
              ),
              BottomNavigationBarItem(
                icon: Icon(Icons.people_outline),
                activeIcon: Icon(Icons.people),
                label: 'Panitia',
              ),
            ],
          ),
        ),
      ),
    );
  }
}
