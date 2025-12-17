export class DateTimeUtils {
  static getTimestampValue(dateField: any): number {
    if (dateField instanceof Date) {
      return dateField.getTime();
    }
    // Assumes Firestore returns an object with seconds and nanoseconds if not a JS Date
    if (dateField && typeof dateField === 'object' && 'seconds' in dateField) {
      return dateField.seconds * 1000; // Convert seconds to milliseconds
    }
    // Fallback if the format is unexpected
    return new Date(dateField).getTime(); 
  }
}
