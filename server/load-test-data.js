// Loads CS 5336/7336 Spring 2026 test data into the database.
// Wipes the DB, recreates schema, seeds admin, and inserts all flights, passengers,
// staff, bags, and bag timelines from the provided Test Data.xlsx.
//
// Run: node server/load-test-data.js
//
// Per instructions:
// - Email for all staff is the user's address
// - Username = lastname (lowercased, alpha only) + 2 random digits
// - Passwords are auto-generated; a credentials list is printed at the end

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const fs = require('fs');

const STAFF_EMAIL = 'mylesmiller2014@gmail.com';
const POST_CHANGE_PASSWORD = 'Demo1234';

// Per the spec, these users "must have logged into the system" before the demo.
// They are simulated as having logged in once and changed their password to POST_CHANGE_PASSWORD.
const REQUIRED_LOGGED_IN = new Set([
  'Mylopolus', 'Louise', 'Reckon',     // AA Gate
  'Guelph',                             // DL Gate
  'Rangers',                            // FA Gate
  'Ramos', 'Weiner', 'Cooper', 'Zhang'  // Ground
]);

function genPassword() {
  const U = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const L = 'abcdefghijkmnpqrstuvwxyz';
  const D = '23456789';
  const all = U + L + D;
  let pwd = U[Math.floor(Math.random() * U.length)] +
            L[Math.floor(Math.random() * L.length)] +
            D[Math.floor(Math.random() * D.length)];
  for (let i = 0; i < 5; i++) pwd += all[Math.floor(Math.random() * all.length)];
  return pwd.split('').sort(() => Math.random() - 0.5).join('');
}

const AIRLINES = {
  AA: 'American Airlines',
  DL: 'Delta Air Lines',
  UA: 'United Airlines',
  FA: 'Frontier Airlines',
  SW: 'Southwest Airlines'
};

const STATUS_MAP = {
  'Checked-in': 'checked-in',
  'Not-checked-in': 'not-checked-in',
  'Boarded': 'boarded'
};

const LOCATION_MAP = {
  'Check-in counter': 'check-in',
  'Security Check': 'security',
  'At-the-gate': 'gate',
  'Loaded': 'loaded'
};

const FLIGHTS = [
  ['AA1360', 'New York', 'C24', 'AA'],
  ['AA3317', 'Los Angeles', 'A38', 'AA'],
  ['AA3290', 'Miami', 'A23', 'AA'],
  ['AA1476', 'Orlando', 'D01', 'AA'],
  ['AA1523', 'Denver', 'C19', 'AA'],
  ['AA1656', 'Chicago', 'A19', 'AA'],
  ['AA2385', 'Minneapolis', 'A20', 'AA'],
  ['AA1175', 'San Francisco', 'C22', 'AA'],
  ['DL2972', 'Minneapolis', 'E13', 'DL'],
  ['DL0839', 'Atlanta', 'E14', 'DL'],
  ['DL2746', 'Detroit', 'E17', 'DL'],
  ['DL2798', 'Salt Lake City', 'E12', 'DL'],
  ['DL0873', 'New York', 'E11', 'DL'],
  ['UA1586', 'Washington D.C.', 'E08', 'UA'],
  ['UA1634', 'Chicago', 'E06', 'UA'],
  ['UA2049', 'Denver', 'E09', 'UA'],
  ['UA2454', 'Newark', 'E05', 'UA'],
  ['FA1270', 'Atlanta', 'E02', 'FA'],
  ['FA3330', 'Raleigh', 'E04', 'FA'],
  ['FA2147', 'Denver', 'E10', 'FA'],
  ['SW2209', 'Phoenix', 'F18', 'SW'],
  ['SW4326', 'Orlando', 'F12', 'SW'],
  ['SW1511', 'Denver', 'F09', 'SW'],
  ['SW1485', 'Nashville', 'F11', 'SW'],
  ['SW1823', 'Los Angeles', 'F02', 'SW']
];

const PASSENGERS = [
  ['Aram', 'Shankar', '654231', '1025104332', 'AA1360', 'Checked-in'],
  ['Malini', 'Shankar', '653955', '1025181960', 'AA1360', 'Checked-in'],
  ['Elaina', 'Peters', '674990', '1025013389', 'AA3317', 'Not-checked-in'],
  ['Martha', 'Washington', '359579', '1025083863', 'AA3290', 'Checked-in'],
  ['Raven', 'Clinch', '892740', '1025794026', 'AA3290', 'Checked-in'],
  ['Brian', 'Anderson', '477001', '1025542351', 'AA1476', 'Boarded'],
  ['Lucy', 'Anderson', '477725', '1025161559', 'AA1476', 'Boarded'],
  ['Samantha', 'Anderson', '477911', '1025407816', 'AA1476', 'Boarded'],
  ['Raj', 'Sinha', '725649', '1025184959', 'AA1523', 'Boarded'],
  ['Ramon', 'Swaggar', '528483', '1025310341', 'AA1656', 'Not-checked-in'],
  ['Chris', 'Swaggar', '520192', '1025316475', 'AA1656', 'Not-checked-in'],
  ['Akbar', 'Mohammad', '782094', '1025255341', 'AA2385', 'Checked-in'],
  ['Ayesha', 'Mohammad', '783331', '1025928327', 'AA2385', 'Checked-in'],
  ['William', 'Dean', '628846', '1025648350', 'AA1175', 'Checked-in'],
  ['Sean', 'Oxford', '856473', '1025305641', 'AA1175', 'Boarded'],
  ['Wen', 'Hu', '134967', '1025395376', 'AA1656', 'Not-checked-in'],
  ['Lisa', 'Hu', '134812', '1025724238', 'AA1656', 'Not-checked-in'],
  ['Chao', 'Hu', '134905', '1025849696', 'AA1656', 'Not-checked-in'],
  ['Reeta', 'Meyer', '367592', '1025532871', 'AA2385', 'Not-checked-in'],
  ['Fu', 'Wang', '289476', '1025012269', 'AA1476', 'Checked-in'],
  ['Cliff', 'Hans', '178944', '1025166978', 'AA3317', 'Not-checked-in'],
  ['Graham', 'Walter', '907467', '1025480184', 'AA1523', 'Boarded'],
  ['Lisa', 'Walter', '905173', '1025514627', 'AA1523', 'Boarded'],
  ['Corey', 'Hill', '666231', '1025048281', 'AA1360', 'Checked-in'],
  ['Shawn', 'Murray', '816733', '1025489325', 'AA1656', 'Checked-in'],
  ['Alex', 'Stoopper', '198583', '1025288095', 'AA3317', 'Not-checked-in'],
  ['Ryan', 'Garfield', '499282', '1025701543', 'AA3290', 'Checked-in'],
  ['Melissa', 'Garfield', '499153', '1025039117', 'AA3290', 'Checked-in'],
  ['Elisa', 'Garfield', '499006', '1025182278', 'AA3290', 'Checked-in'],
  ['Vicky', 'Garfield', '499377', '1025248963', 'AA3290', 'Checked-in'],
  ['Marcus', 'Shane', '725784', '1025834657', 'AA1175', 'Checked-in'],
  ['Amanda', 'Richard', '672668', '1025871331', 'AA2385', 'Checked-in'],
  ['Charles', 'Deckon', '726493', '1025509839', 'AA3290', 'Not-checked-in'],
  ['Francis', 'Cox', '825644', '1025301031', 'AA1476', 'Boarded'],
  ['Ruthford', 'Cox', '825490', '1025051834', 'AA1476', 'Boarded'],
  ['Mary', 'Cox', '825178', '1025738299', 'AA1476', 'Boarded'],
  ['Sarah', 'Mullard', '907943', '1025737631', 'AA1656', 'Not-checked-in'],
  ['Ma', 'Liang', '200194', '1025165667', 'AA1175', 'Boarded'],
  ['Lou', 'Liang', '204788', '1025010651', 'AA1175', 'Boarded'],
  ['Grace', 'Liang', '208897', '1025333872', 'AA1175', 'Boarded'],
  ['Anna', 'Swanson', '438845', '1025624731', 'AA1523', 'Boarded'],
  ['Mike', 'Ruth', '717273', '1025781080', 'AA1360', 'Checked-in'],
  ['Miley', 'Ruth', '712906', '1025132677', 'AA1360', 'Checked-in'],
  ['Akalya', 'Promod', '301486', '1025360260', 'AA3317', 'Not-checked-in'],
  ['Arya', 'Promod', '301857', '1025647468', 'AA3317', 'Not-checked-in'],
  ['Laksh', 'Promod', '301735', '1025723430', 'AA3317', 'Not-checked-in'],
  ['Shasha', 'Brunswick', '629453', '1025980500', 'AA1476', 'Checked-in'],
  ['Delores', 'Bensen', '103785', '1025978820', 'AA1476', 'Checked-in'],
  ['Shirley', 'Albert', '826648', '1025812191', 'AA3317', 'Not-checked-in'],
  ['Vikram', 'Albert', '826506', '1025361939', 'AA3317', 'Not-checked-in'],
  ['Ravi', 'Albert', '826005', '1025909169', 'AA3317', 'Not-checked-in'],
  ['Riku', 'Suzuki', '737493', '1025985435', 'AA1360', 'Not-checked-in'],
  ['Daniel', 'Wong', '656562', '1025346247', 'AA1175', 'Checked-in'],
  ['Chris', 'Wong', '650767', '1025510799', 'AA1175', 'Checked-in'],
  ['Isabella', 'Leonardo', '429991', '1025118384', 'AA2385', 'Checked-in'],
  ['Arjun', 'Mahajan', '295909', '1025251354', 'AA2385', 'Checked-in'],
  ['Lei', 'Huang', '639953', '1025278498', 'AA1175', 'Boarded'],
  ['Rajan', 'Kishore', '916744', '1025084124', 'AA1360', 'Checked-in'],
  ['Brian', 'Goldorf', '582664', '1025118244', 'AA1523', 'Boarded'],
  ['Melene', 'Thomson', '378596', '1025935348', 'AA3290', 'Not-checked-in'],
  ['Joanne', 'Adams', '667802', '2373740164', 'DL2972', 'Checked-in'],
  ['Johnny', 'Adams', '667036', '2373005242', 'DL2972', 'Checked-in'],
  ['James', 'Adams', '667132', '2373786801', 'DL2972', 'Checked-in'],
  ['James', 'Williamson', '725648', '2373128059', 'DL0839', 'Not-checked-in'],
  ['Kimberly', 'Briggs', '815848', '2373826204', 'DL2746', 'Boarded'],
  ['Rapston', 'Briggs', '815002', '2373505331', 'DL2746', 'Boarded'],
  ['Clement', 'Sanderson', '288769', '2373586923', 'DL0873', 'Not-checked-in'],
  ['Laura', 'Tangen', '936742', '2373226025', 'DL0873', 'Checked-in'],
  ['Richard', 'Tangen', '937768', '2373634216', 'DL0873', 'Checked-in'],
  ['Curie', 'Tangen', '931118', '2373073375', 'DL0873', 'Checked-in'],
  ['Alisa', 'Tangen', '930102', '2373433036', 'DL0873', 'Checked-in'],
  ['Megan', 'Thompson', '739574', '2373541458', 'DL2972', 'Checked-in'],
  ['Sue', 'Hanson', '202029', '2373685014', 'DL2746', 'Boarded'],
  ['Craig', 'Lumbord', '304586', '2373294019', 'DL0839', 'Not-checked-in'],
  ['Christopher', 'Walker', '668956', '2373655698', 'DL0873', 'Not-checked-in'],
  ['Kim', 'Dillon', '896734', '2373169340', 'DL2972', 'Not-checked-in'],
  ['Brandon', 'Richman', '190285', '2373608835', 'DL2746', 'Boarded'],
  ['Erica', 'Cobb', '724546', '2373615951', 'DL2798', 'Not-checked-in'],
  ['Rachel', 'Marcos', '494022', '2373484656', 'DL2798', 'Not-checked-in'],
  ['Lisbeth', 'Monroe', '423017', '2373482366', 'DL2798', 'Not-checked-in'],
  ['Jacob', 'Weiner', '801774', '5784299468', 'UA1586', 'Checked-in'],
  ['Erica', 'Sanderson', '528473', '5784044369', 'UA1634', 'Not-checked-in'],
  ['Miley', 'Sanderson', '528092', '5784957773', 'UA1634', 'Not-checked-in'],
  ['Wayne', 'Armstrong', '825744', '5784872148', 'UA2049', 'Not-checked-in'],
  ['Amira', 'Sutherland', '712355', '5784951343', 'UA2454', 'Not-checked-in'],
  ['Dana', 'Sutherland', '712067', '5784320037', 'UA2454', 'Not-checked-in'],
  ['Eric', 'Sutherland', '712546', '5784917693', 'UA2454', 'Not-checked-in'],
  ['Andy', 'Klapper', '716767', '5784676320', 'UA1586', 'Checked-in'],
  ['Mark', 'Edison', '836566', '5784163287', 'UA2049', 'Checked-in'],
  ['Mike', 'Potulla', '555522', '5784083172', 'UA2049', 'Checked-in'],
  ['Samantha', 'Foley', '893775', '6012788957', 'FA1270', 'Boarded'],
  ['Sara', 'Olsen', '333585', '6012986872', 'FA3330', 'Not-checked-in'],
  ['Maria', 'Luther', '818886', '6012774348', 'FA3330', 'Checked-in'],
  ['Robert', 'Luther', '818752', '6012734714', 'FA3330', 'Checked-in'],
  ['Asim', 'Khan', '298374', '6012345581', 'FA2147', 'Checked-in'],
  ['Maira', 'Khan', '295876', '6012223623', 'FA2147', 'Checked-in'],
  ['Jackson', 'Burand', '104769', '6012166587', 'FA1270', 'Boarded'],
  ['Elizabeth', 'Burand', '104335', '6012603669', 'FA1270', 'Boarded'],
  ['Luke', 'Simmerson', '827364', '6012096705', 'FA1270', 'Checked-in'],
  ['Timothy', 'Cobalt', '907856', '6012466889', 'FA2147', 'Checked-in'],
  ['Richard', 'Bloggs', '284658', '9024785776', 'SW2209', 'Not-checked-in'],
  ['Sun', 'Wong', '538859', '9029377578', 'SW2209', 'Not-checked-in'],
  ['Ding', 'Wong', '538102', '9021102884', 'SW2209', 'Not-checked-in'],
  ['Maya', 'Sterling', '725656', '9027956745', 'SW2209', 'Checked-in'],
  ['Elias', 'Thorne', '836675', '9028666623', 'SW2209', 'Checked-in'],
  ['Julian', 'Voss', '102775', '9028877593', 'SW4326', 'Not-checked-in'],
  ['Hament', 'Voss', '102443', '9026477104', 'SW4326', 'Not-checked-in'],
  ['Marcus', 'Holloway', '909012', '9020907345', 'SW1511', 'Not-checked-in'],
  ['Elena', 'Holloway', '901544', '9021728384', 'SW1511', 'Not-checked-in'],
  ['Simon', 'Beck', '777236', '9020192837', 'SW1511', 'Not-checked-in'],
  ['Clara', 'Montgomery', '626368', '9021177883', 'SW1511', 'Not-checked-in'],
  ['Avir', 'Jenkins', '535538', '9021582838', 'SW1511', 'Not-checked-in'],
  ['Zara', 'Chen', '173564', '9020902647', 'SW1485', 'Not-checked-in'],
  ['Farah', 'Quinn', '822845', '9025453754', 'SW1485', 'Not-checked-in'],
  ['Leo', 'Grant', '866623', '9023333626', 'SW1485', 'Not-checked-in'],
  ['Mia', 'Vance', '342627', '9021341568', 'SW1823', 'Not-checked-in'],
  ['Desmond', 'Fitzgerald', '253664', '9027675747', 'SW1823', 'Not-checked-in'],
  ['Beatrice', 'Fitzgerald', '253901', '9026655844', 'SW1823', 'Not-checked-in'],
  ['Victoria', 'Fitzgerald', '253189', '9026655285', 'SW1823', 'Not-checked-in'],
  ['Nathan', 'Brooks', '167746', '9021784611', 'SW1823', 'Not-checked-in']
];

const BAGS = [
  ['100296', '1025104332', 'AA1360', 'Check-in counter'],
  ['100401', '1025181960', 'AA1360', 'Check-in counter'],
  ['100595', '1025083863', 'AA3290', 'Security Check'],
  ['100535', '1025083863', 'AA3290', 'Security Check'],
  ['100525', '1025542351', 'AA1476', 'At-the-gate'],
  ['100444', '1025161559', 'AA1476', 'At-the-gate'],
  ['100346', '1025255341', 'AA2385', 'Security Check'],
  ['100837', '1025928327', 'AA2385', 'Security Check'],
  ['100462', '1025305641', 'AA1175', 'Loaded'],
  ['100805', '1025480184', 'AA1523', 'Loaded'],
  ['100594', '1025489325', 'AA1656', 'At-the-gate'],
  ['100911', '1025701543', 'AA3290', 'Security Check'],
  ['100939', '1025701543', 'AA3290', 'Security Check'],
  ['100833', '1025039117', 'AA3290', 'Security Check'],
  ['100838', '1025039117', 'AA3290', 'Security Check'],
  ['100960', '1025871331', 'AA2385', 'Security Check'],
  ['100208', '1025301031', 'AA1476', 'At-the-gate'],
  ['100489', '1025051834', 'AA1476', 'At-the-gate'],
  ['100060', '1025738299', 'AA1476', 'At-the-gate'],
  ['100642', '1025165667', 'AA1175', 'Loaded'],
  ['100708', '1025010651', 'AA1175', 'Loaded'],
  ['100684', '1025333872', 'AA1175', 'Loaded'],
  ['100959', '1025624731', 'AA1523', 'At-the-gate'],
  ['100558', '1025118384', 'AA2385', 'Security Check'],
  ['100386', '1025251354', 'AA2385', 'Security Check'],
  ['100941', '1025278498', 'AA1175', 'Loaded'],
  ['100786', '1025084124', 'AA1360', 'Check-in counter'],
  ['200487', '2373740164', 'DL2972', 'Security Check'],
  ['200108', '2373005242', 'DL2972', 'Security Check'],
  ['200645', '2373826204', 'DL2746', 'At-the-gate'],
  ['200115', '2373505331', 'DL2746', 'At-the-gate'],
  ['200865', '2373226025', 'DL0873', 'Security Check'],
  ['200992', '2373226025', 'DL0873', 'Security Check'],
  ['200221', '2373634216', 'DL0873', 'Security Check'],
  ['200787', '2373634216', 'DL0873', 'Security Check'],
  ['500442', '5784299468', 'UA1586', 'Check-in counter'],
  ['500729', '5784676320', 'UA1586', 'Check-in counter'],
  ['600109', '6012788957', 'FA1270', 'At-the-gate'],
  ['600113', '6012774348', 'FA3330', 'At-the-gate'],
  ['600602', '6012734714', 'FA3330', 'At-the-gate'],
  ['600836', '6012166587', 'FA1270', 'At-the-gate'],
  ['600105', '6012603669', 'FA1270', 'At-the-gate'],
  ['836675', '9028666623', 'SW2209', 'Security Check']
];

const AIRLINE_STAFF = [
  ['Sankar', 'Madhavan', '9726743787', 'AA'],
  ['Alice', 'Richardson', '9725794785', 'AA'],
  ['Mike', 'Hamsworth', '9728819003', 'AA'],
  ['Tom', 'Cruise', '2147593675', 'DL'],
  ['Amana', 'Burgs', '2148933457', 'DL'],
  ['Adam', 'Frank', '5148654783', 'UA'],
  ['Harry', 'Johnson', '6093782645', 'FA'],
  ['Cathy', 'Jameson', '2140092178', 'SW'],
  ['Julian', 'Prescott', '9721782746', 'SW']
];

const GATE_STAFF = [
  ['Liam', 'Mylopolus', '9720231115', 'AA'],
  ['Scott', 'Louise', '9727626363', 'AA'],
  ['Emily', 'Reckon', '9729789789', 'AA'],
  ['Rudy', 'Guelph', '2148109203', 'DL'],
  ['Joe', 'Klein', '2149336336', 'DL'],
  ['Robert', 'Milner', '5149365786', 'UA'],
  ['Steve', 'Rangers', '6096264775', 'FA'],
  ['Sabastian', 'Ashford', '9721021029', 'SW'],
  ['Dominic', 'Whitaker', '9721131872', 'SW']
];

const GROUND_STAFF = [
  ['Galvin', 'Ramos', '9725785964'],
  ['Robert', 'Languire', '9722220967'],
  ['Jacob', 'Weiner', '9721102834'],
  ['Karson', 'Dillon', '9720024783'],
  ['Rocky', 'White', '9728778749'],
  ['Arjun', 'Singh', '9725375678'],
  ['Tom', 'Cooper', '9729029090'],
  ['Minato', 'Surshki', '9725775795'],
  ['Claine', 'Wauker', '9725125346'],
  ['Yeng', 'Zhang', '9723433435']
];

function genUsername(lastname, used) {
  const base = lastname.toLowerCase().replace(/[^a-z]/g, '');
  for (let i = 0; i < 100; i++) {
    const digits = Math.floor(Math.random() * 90 + 10);
    const username = `${base}${digits}`;
    if (!used.has(username)) {
      used.add(username);
      return username;
    }
  }
  throw new Error(`Could not generate unique username for ${lastname}`);
}

async function load() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
  });

  try {
    await conn.query('DROP DATABASE IF EXISTS airport_ops');
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await conn.query(schema);
    await conn.query('USE airport_ops');
    console.log('Schema reset.\n');

    const adminHash = await bcrypt.hash('Admin123', 10);
    const postChangeHash = await bcrypt.hash(POST_CHANGE_PASSWORD, 10);

    await conn.query(
      `INSERT INTO user (id, username, role, firstname, lastname, email, phone, airline) VALUES
       ('admin_001', 'admin', 'admin', 'System', 'Administrator', ?, '5551234567', NULL)`,
      [STAFF_EMAIL]
    );
    await conn.query(
      `INSERT INTO user_credentials (username, password_hash, must_change_password) VALUES ('admin', ?, 0)`,
      [adminHash]
    );

    const usedUsernames = new Set(['admin']);
    const credentials = [];

    // Insert staff users — each gets a uniquely generated password.
    // "Required" instructor users are marked as already-logged-in (must_change_password=0,
    // password = POST_CHANGE_PASSWORD) to satisfy the spec.
    async function insertStaff(role, list, hasAirline) {
      let i = 1;
      for (const row of list) {
        const [firstname, lastname, phone, airline] = hasAirline
          ? row
          : [row[0], row[1], row[2], null];
        const lname = lastname.trim();
        const username = genUsername(lname, usedUsernames);
        const id = `${role}_${String(i).padStart(3, '0')}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        const isRequired = REQUIRED_LOGGED_IN.has(lname);
        const generatedPwd = genPassword();
        const hash = isRequired ? postChangeHash : await bcrypt.hash(generatedPwd, 10);
        const mustChange = isRequired ? 0 : 1;

        await conn.query(
          `INSERT INTO user (id, username, role, firstname, lastname, email, phone, airline) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [id, username, role, firstname.trim(), lname, STAFF_EMAIL, phone, airline]
        );
        await conn.query(
          `INSERT INTO user_credentials (username, password_hash, must_change_password) VALUES (?, ?, ?)`,
          [username, hash, mustChange]
        );
        credentials.push({
          role,
          name: `${firstname.trim()} ${lname}`,
          username,
          airline: airline || '-',
          password: isRequired ? `${POST_CHANGE_PASSWORD} (post-login change)` : generatedPwd,
          loggedIn: isRequired
        });
        i++;
      }
    }

    await insertStaff('airline_staff', AIRLINE_STAFF, true);
    await insertStaff('gate_staff', GATE_STAFF, true);
    await insertStaff('ground_staff', GROUND_STAFF, false);
    console.log(`Inserted ${credentials.length} staff users.`);

    // Determine flight statuses based on passenger statuses
    const flightStatuses = {};
    for (const p of PASSENGERS) {
      const fn = p[4];
      const status = p[5];
      if (status === 'Boarded') {
        flightStatuses[fn] = 'boarding';
      } else if (status === 'Checked-in' && !flightStatuses[fn]) {
        flightStatuses[fn] = 'scheduled';
      } else if (!flightStatuses[fn]) {
        flightStatuses[fn] = 'scheduled';
      }
    }

    // Insert flights — departure times spread across next 8 hours
    const now = Date.now();
    let flightTimeOffset = 0;
    for (const [flightNumber, destination, gate, airlineCode] of FLIGHTS) {
      const id = `${flightNumber}_${now}_${Math.floor(Math.random() * 1000)}`;
      const departure = new Date(now + (2 + flightTimeOffset * 0.25) * 60 * 60 * 1000);
      const status = flightStatuses[flightNumber] || 'scheduled';
      await conn.query(
        `INSERT INTO flight (id, flight_number, airline_name, gate, destination, departure_time, status) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, flightNumber, AIRLINES[airlineCode], gate, destination, departure, status]
      );
      flightTimeOffset++;
    }
    console.log(`Inserted ${FLIGHTS.length} flights.`);

    // Build flight number -> id map
    const [flightRows] = await conn.query('SELECT id, flight_number FROM flight');
    const flightIdByNumber = {};
    for (const f of flightRows) flightIdByNumber[f.flight_number] = f.id;

    // Insert passengers
    let passengerCount = 0;
    for (const [firstname, lastname, id, ticket, flightNumber, statusRaw] of PASSENGERS) {
      const flightId = flightIdByNumber[flightNumber];
      if (!flightId) {
        console.warn(`  Skipping passenger ${firstname} ${lastname}: flight ${flightNumber} not found`);
        continue;
      }
      const status = STATUS_MAP[statusRaw];
      const checkedInAt = (status === 'checked-in' || status === 'boarded') ? new Date(now - 60 * 60 * 1000) : null;
      const boardedAt = status === 'boarded' ? new Date(now - 30 * 60 * 1000) : null;

      await conn.query(
        `INSERT INTO passenger (id, firstname, lastname, ticket_number, flight_id, status, email, phone, checked_in_at, boarded_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, NULL, ?, ?)`,
        [id, firstname.trim(), lastname.trim(), ticket, flightId, status, `${firstname.trim().toLowerCase()}.${lastname.trim().toLowerCase()}@email.com`, checkedInAt, boardedAt]
      );
      await conn.query(
        `INSERT INTO flight_passenger (flight_id, ticket_number) VALUES (?, ?)`,
        [flightId, ticket]
      );
      passengerCount++;
    }
    console.log(`Inserted ${passengerCount} passengers.`);

    // Insert bags
    let bagCount = 0;
    for (const [bagId, ticket, flightNumber, locRaw] of BAGS) {
      const flightId = flightIdByNumber[flightNumber];
      if (!flightId) continue;
      const [pRows] = await conn.query('SELECT id FROM passenger WHERE ticket_number = ?', [ticket]);
      if (pRows.length === 0) continue;
      const passengerId = pRows[0].id;
      const location = LOCATION_MAP[locRaw];

      await conn.query(
        `INSERT INTO bag (id, ticket_number, passenger_id, flight_id, location) VALUES (?, ?, ?, ?, ?)`,
        [bagId, ticket, passengerId, flightId, location]
      );
      // Build a plausible timeline
      const seq = ['check-in', 'security', 'gate', 'loaded'];
      const idx = seq.indexOf(location);
      for (let j = 0; j <= idx; j++) {
        const ts = new Date(now - (60 - j * 10) * 60 * 1000);
        await conn.query(
          `INSERT INTO bag_timeline (bag_id, location, timestamp, handled_by) VALUES (?, ?, ?, NULL)`,
          [bagId, seq[j], ts]
        );
      }
      bagCount++;
    }
    console.log(`Inserted ${bagCount} bags with timelines.\n`);

    const lines = [];
    const log = (s = '') => { console.log(s); lines.push(s); };
    log('='.repeat(90));
    log('TEST DATA LOADED — STAFF CREDENTIALS (keep this with you for the demo)');
    log('='.repeat(90));
    log(`\nAdmin login:   username=admin   password=Admin123\n`);
    log(`Required instructor users (already "logged in", password changed): ${POST_CHANGE_PASSWORD}`);
    log(`All other staff: auto-generated password shown below; must change on first login.\n`);

    const printed = { airline_staff: 'AIRLINE STAFF', gate_staff: 'GATE STAFF', ground_staff: 'GROUND STAFF' };
    for (const role of Object.keys(printed)) {
      log('-'.repeat(90));
      log(printed[role]);
      log('-'.repeat(90));
      for (const c of credentials.filter(c => c.role === role)) {
        const tag = c.loggedIn ? '[LOGGED IN]' : '           ';
        log(`  ${tag}  ${c.name.padEnd(22)}  user: ${c.username.padEnd(14)}  pass: ${String(c.password).padEnd(28)}  airline: ${c.airline}`);
      }
      log('');
    }
    log('='.repeat(90));

    fs.writeFileSync(path.join(__dirname, '..', 'DEMO_CREDENTIALS.txt'), lines.join('\n'));
    console.log('\nCredentials saved to DEMO_CREDENTIALS.txt');
  } catch (err) {
    console.error('Load error:', err);
    process.exit(1);
  } finally {
    await conn.end();
  }
}

load();
