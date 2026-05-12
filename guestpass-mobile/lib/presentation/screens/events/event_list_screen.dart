import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:guestpass_mobile/config/theme.dart';
import 'package:guestpass_mobile/logic/event/event_cubit.dart';
import 'package:guestpass_mobile/logic/event/event_state.dart';
import 'package:guestpass_mobile/presentation/screens/events/event_detail_screen.dart';
import 'package:guestpass_mobile/presentation/screens/events/event_create_screen.dart';
import 'package:guestpass_mobile/utils/helpers.dart';

/// Layar Daftar Event
class EventListScreen extends StatefulWidget {
  const EventListScreen({super.key});

  @override
  State<EventListScreen> createState() => _EventListScreenState();
}

class _EventListScreenState extends State<EventListScreen> {
  late final EventCubit _eventCubit;

  @override
  void initState() {
    super.initState();
    _eventCubit = EventCubit()..loadEvents();
  }

  @override
  void dispose() {
    _eventCubit.close();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return BlocProvider.value(
      value: _eventCubit,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Event'),
          actions: [
            IconButton(
              icon: const Icon(Icons.add_circle_outline),
              onPressed: () async {
                final result = await Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const EventCreateScreen()),
                );
                if (result == true) _eventCubit.loadEvents();
              },
            ),
          ],
        ),
        body: BlocBuilder<EventCubit, EventState>(
          builder: (context, state) {
            if (state is EventLoading) {
              return const Center(child: CircularProgressIndicator());
            }

            if (state is EventError) {
              return Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.error_outline, size: 40, color: AppColors.muted),
                    const SizedBox(height: 12),
                    Text(state.message, style: const TextStyle(color: AppColors.muted)),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: () => _eventCubit.loadEvents(),
                      child: const Text('Coba Lagi'),
                    ),
                  ],
                ),
              );
            }

            if (state is EventLoaded) {
              if (state.events.isEmpty) {
                return Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.event_outlined, size: 48, color: AppColors.muted),
                      const SizedBox(height: 12),
                      const Text(
                        'Belum ada event',
                        style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: AppColors.foreground),
                      ),
                      const SizedBox(height: 4),
                      const Text(
                        'Buat event pertama Anda',
                        style: TextStyle(fontSize: 13, color: AppColors.muted),
                      ),
                      const SizedBox(height: 20),
                      ElevatedButton.icon(
                        onPressed: () async {
                          final result = await Navigator.push(
                            context,
                            MaterialPageRoute(builder: (_) => const EventCreateScreen()),
                          );
                          if (result == true) _eventCubit.loadEvents();
                        },
                        icon: const Icon(Icons.add, size: 18),
                        label: const Text('Buat Event'),
                      ),
                    ],
                  ),
                );
              }

              return RefreshIndicator(
                onRefresh: () => _eventCubit.loadEvents(),
                child: ListView.separated(
                  padding: const EdgeInsets.all(20),
                  itemCount: state.events.length,
                  separatorBuilder: (_, i) => const SizedBox(height: 10),
                  itemBuilder: (context, index) {
                    final event = state.events[index];
                    return GestureDetector(
                      onTap: () async {
                        final result = await Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => EventDetailScreen(eventId: event.id),
                          ),
                        );
                        if (result == true) _eventCubit.loadEvents();
                      },
                      child: Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppColors.border),
                        ),
                        child: Row(
                          children: [
                            Container(
                              width: 44,
                              height: 44,
                              decoration: BoxDecoration(
                                color: AppColors.primaryLight,
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: Center(
                                child: Text(
                                  event.name.isNotEmpty ? event.name[0].toUpperCase() : 'E',
                                  style: const TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.w700,
                                    color: AppColors.primary,
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(width: 14),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    event.name,
                                    style: const TextStyle(
                                      fontSize: 14,
                                      fontWeight: FontWeight.w600,
                                      color: AppColors.foreground,
                                    ),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  const SizedBox(height: 4),
                                  Row(
                                    children: [
                                      const Icon(Icons.location_on_outlined, size: 13, color: AppColors.muted),
                                      const SizedBox(width: 4),
                                      Expanded(
                                        child: Text(
                                          event.location,
                                          style: const TextStyle(fontSize: 12, color: AppColors.muted),
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                Text(
                                  AppHelpers.formatDate(event.date.toIso8601String()),
                                  style: const TextStyle(fontSize: 11, color: AppColors.muted),
                                ),
                                const SizedBox(height: 4),
                                const Icon(Icons.chevron_right, size: 18, color: AppColors.muted),
                              ],
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              );
            }

            return const SizedBox.shrink();
          },
        ),
      ),
    );
  }
}
