import { useReceiverStore } from '../../store/useReceiverStore';

export default function ScreenReaderAnnouncer() {
  const announcementText = useReceiverStore((s) => s.announcementText);
  const activeStation = useReceiverStore((s) => s.getActiveStation());
  const currentPoint = useReceiverStore((s) => s.getCurrentPoint());
  const isPlaying = useReceiverStore((s) => s.isPlaying);

  return (
    <div className="sr-only">
      {/* Live region for dynamic state changes */}
      <div role="status" aria-live="polite" aria-atomic="true">
        {announcementText}
      </div>

      {/* Persistent structured context for screen readers */}
      <section aria-label="Current NASA Sonification Status">
        <h2>{activeStation.name}</h2>
        <p>Instrument: {activeStation.instrument}</p>
        <p>Mission: {activeStation.mission}</p>
        <p>
          Status: {isPlaying ? 'Playing sonification' : 'Paused'}. Currently focused on{' '}
          {currentPoint?.location}, latitude {currentPoint?.latitude} degrees, longitude{' '}
          {currentPoint?.longitude} degrees. Scientific observation value is{' '}
          {currentPoint?.value} {activeStation.parameterUnit}. Sonified acoustic note:{' '}
          {currentPoint?.noteName}.
        </p>
      </section>
    </div>
  );
}
