import 'package:equatable/equatable.dart';
import 'package:guestpass_mobile/data/models/event.dart';

/// State untuk EventCubit
abstract class EventState extends Equatable {
  const EventState();

  @override
  List<Object?> get props => [];
}

class EventInitial extends EventState {}

class EventLoading extends EventState {}

class EventLoaded extends EventState {
  final List<Event> events;

  const EventLoaded({required this.events});

  @override
  List<Object?> get props => [events];
}

class EventDetailLoaded extends EventState {
  final Event event;

  const EventDetailLoaded({required this.event});

  @override
  List<Object?> get props => [event];
}

class EventSuccess extends EventState {
  final String message;

  const EventSuccess({required this.message});

  @override
  List<Object?> get props => [message];
}

class EventError extends EventState {
  final String message;

  const EventError({required this.message});

  @override
  List<Object?> get props => [message];
}
