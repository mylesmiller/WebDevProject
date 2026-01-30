// Generate random username based on name and role
export const generateUsername = (name, role) => {
  // Take first 2 letters of first name and first 2 letters of last name
  const nameParts = name.trim().toLowerCase().split(' ');
  const firstName = nameParts[0] || 'user';
  const lastName = nameParts[nameParts.length - 1] || 'name';

  const prefix = firstName.substring(0, 2) + lastName.substring(0, 2);

  // Add 2 random digits
  const digits = Math.floor(Math.random() * 90 + 10); // 10-99

  return `${prefix}${digits}`;
};

// Generate random password that meets requirements
export const generatePassword = () => {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const allChars = uppercase + lowercase + numbers;

  // Ensure at least one of each required type
  let password = '';
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];

  // Add 5 more random characters (total 8 chars)
  for (let i = 0; i < 5; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

// Generate unique bag ID
export const generateBagId = (existingBags = {}) => {
  let bagId;
  let attempts = 0;

  do {
    bagId = Math.floor(100000 + Math.random() * 900000).toString();
    attempts++;

    if (attempts > 100) {
      throw new Error('Unable to generate unique bag ID');
    }
  } while (existingBags[bagId]);

  return bagId;
};

// Generate unique user ID
export const generateUserId = (existingUsers = {}) => {
  let userId;
  let attempts = 0;

  do {
    userId = `user_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    attempts++;

    if (attempts > 100) {
      throw new Error('Unable to generate unique user ID');
    }
  } while (existingUsers[userId]);

  return userId;
};

// Generate unique flight ID
export const generateFlightId = (airline, flightNumber) => {
  return `${airline}${flightNumber}_${Date.now()}`;
};

// Generate unique message ID
export const generateMessageId = () => {
  return `msg_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
};
