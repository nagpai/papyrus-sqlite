// Utility to validate and parse apartment numbers
// Format: [Wing][Floor][Unit]
// Example: A101 = Wing A, Floor 1, Unit 01
//          B2503 = Wing B, Floor 25, Unit 03

export interface ParsedApartment {
  wing: 'A' | 'B' | 'C' | 'D';
  floor: number;
  unit: number;
  apartmentNumber: string;
}

export const parseApartmentNumber = (apartmentNumber: string): ParsedApartment | null => {
  // Remove spaces and convert to uppercase
  const cleaned = apartmentNumber.trim().toUpperCase();

  // Regex pattern: Wing (A-D) + Floor (1-27, can be 1-2 digits) + Unit (1-4, always 2 digits)
  const pattern = /^([A-D])(\d{1,2})(\d{2})$/;
  const match = cleaned.match(pattern);

  if (!match) {
    return null;
  }

  const wing = match[1] as 'A' | 'B' | 'C' | 'D';
  const floor = parseInt(match[2], 10);
  const unit = parseInt(match[3], 10);

  // Validate ranges
  if (floor < 1 || floor > 27) {
    return null;
  }

  if (unit < 1 || unit > 4) {
    return null;
  }

  // Format apartment number consistently: Wing + Floor (2 digits) + Unit (2 digits)
  const formattedApartmentNumber = `${wing}${floor.toString().padStart(2, '0')}${unit.toString().padStart(2, '0')}`;

  return {
    wing,
    floor,
    unit,
    apartmentNumber: formattedApartmentNumber,
  };
};

export const validateApartmentNumber = (apartmentNumber: string): boolean => {
  return parseApartmentNumber(apartmentNumber) !== null;
};

export const formatApartmentNumber = (wing: string, floor: number, unit: number): string => {
  return `${wing}${floor.toString().padStart(2, '0')}${unit.toString().padStart(2, '0')}`;
};
