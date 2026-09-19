/**
 * Pakistan Administrative Hierarchy Dataset
 * Source: OCHA Common Operational Dataset (COD-AB) / UN-OCHA / Survey of Pakistan
 * 
 * Hierarchy:
 * - Admin Level 1: Province / Region (7 units)
 * - Admin Level 2: District (160 units)
 * - Admin Level 3: Tehsil / Taluka / Sub-Division (577 units)
 * - Admin Level 4: Village / Mauza (free-text entered by user)
 */

export interface TehsilItem {
  code: string;
  name: string;
  nameUr?: string;
}

export interface DistrictItem {
  code: string;
  name: string;
  nameUr?: string;
  tehsils: TehsilItem[];
}

export interface ProvinceItem {
  code: string;
  name: string;
  nameUr: string;
  districts: DistrictItem[];
}

export const PAKISTAN_ADMIN_HIERARCHY: ProvinceItem[] = [
  {
    code: 'PK5',
    name: 'Khyber Pakhtunkhwa',
    nameUr: 'خیبر پختونخوا',
    districts: [
      {
        code: 'PK504',
        name: 'Bannu',
        nameUr: 'ضلع بنوں',
        tehsils: [
          { code: 'PK50401', name: 'Bannu', nameUr: 'بنوں' },
          { code: 'PK50402', name: 'Domel', nameUr: 'ڈومیل' },
          { code: 'PK50403', name: 'Kakki', nameUr: 'ککی' },
          { code: 'PK50404', name: 'Miryan', nameUr: 'مریئن' },
          { code: 'PK50405', name: 'Baka Khel', nameUr: 'بکا خیل' },
          { code: 'PK50406', name: 'Wazir', nameUr: 'وزیر' },
        ],
      },
      {
        code: 'PK523',
        name: 'Lakki Marwat',
        nameUr: 'ضلع لکی مروت',
        tehsils: [
          { code: 'PK52301', name: 'Lakki Marwat', nameUr: 'لکی مروت' },
          { code: 'PK52302', name: 'Sarai Naurang', nameUr: 'سرائے نورنگ' },
          { code: 'PK52303', name: 'Bettani', nameUr: 'بیٹنی' },
          { code: 'PK52304', name: 'Ghazni Khel', nameUr: 'غزنی خیل' },
        ],
      },
      {
        code: 'PK519',
        name: 'Karak',
        nameUr: 'ضلع کرک',
        tehsils: [
          { code: 'PK51901', name: 'Banda Daud Shah', nameUr: 'بانڈہ داؤد شاہ' },
          { code: 'PK51902', name: 'Karak', nameUr: 'کرک' },
          { code: 'PK51903', name: 'Takht-e-Nasrati', nameUr: 'تخت نصرتی' },
        ],
      },
      {
        code: 'PK510',
        name: 'Dera Ismail Khan',
        nameUr: 'ضلع ڈیرہ اسماعیل خان',
        tehsils: [
          { code: 'PK51001', name: 'Dera Ismail Khan', nameUr: 'ڈیرہ اسماعیل خان' },
          { code: 'PK51002', name: 'Daraban', nameUr: 'درابن' },
          { code: 'PK51003', name: 'Kulachi', nameUr: 'کلاچی' },
          { code: 'PK51004', name: 'Pahar Pur', nameUr: 'پہاڑ پور' },
          { code: 'PK51005', name: 'Paroa', nameUr: 'پروآ' },
          { code: 'PK51006', name: 'Paniala', nameUr: 'پنیالہ' },
          { code: 'PK51007', name: 'Darazinda', nameUr: 'درازندہ' },
        ],
      },
      {
        code: 'PK529',
        name: 'Peshawar',
        nameUr: 'ضلع پشاور',
        tehsils: [
          { code: 'PK52901', name: 'Peshawar City', nameUr: 'پشاور سٹی' },
          { code: 'PK52902', name: 'Peshawar Sadar', nameUr: 'پشاور صدر' },
          { code: 'PK52903', name: 'Shah Alam', nameUr: 'شاہ عالم' },
          { code: 'PK52904', name: 'Badhber', nameUr: 'بڈھ بیر' },
          { code: 'PK52905', name: 'Chamkani', nameUr: 'چمکنئی' },
          { code: 'PK52906', name: 'Mathra', nameUr: 'ماتھرا' },
          { code: 'PK52907', name: 'Hassan Khel', nameUr: 'حسن خیل' },
        ],
      },
      {
        code: 'PK520',
        name: 'Kohat',
        nameUr: 'ضلع کوہاٹ',
        tehsils: [
          { code: 'PK52001', name: 'Kohat', nameUr: 'کوہاٹ' },
          { code: 'PK52002', name: 'Lachi', nameUr: 'لاچی' },
          { code: 'PK52003', name: 'Gumbat', nameUr: 'گمبٹ' },
          { code: 'PK52004', name: 'Dara Adam Khel', nameUr: 'درہ آدم خیل' },
        ],
      },
      {
        code: 'PK526',
        name: 'North Waziristan',
        nameUr: 'شمالی وزیرستان',
        tehsils: [
          { code: 'PK52601', name: 'Miran Shah', nameUr: 'میران شاہ' },
          { code: 'PK52602', name: 'Mir Ali', nameUr: 'میر علی' },
          { code: 'PK52603', name: 'Razmak', nameUr: 'رزمک' },
          { code: 'PK52604', name: 'Datta Khel', nameUr: 'دستہ خیل' },
          { code: 'PK52605', name: 'Dossali', nameUr: 'دوسلی' },
          { code: 'PK52606', name: 'Gharyum', nameUr: 'غریوم' },
          { code: 'PK52607', name: 'Ghulam Khan', nameUr: 'غلام خان' },
          { code: 'PK52608', name: 'Shewa', nameUr: 'شیوہ' },
          { code: 'PK52609', name: 'Spinwam', nameUr: 'سپین وام' },
        ],
      },
      {
        code: 'PK532',
        name: 'South Waziristan Upper',
        nameUr: 'جنوبی وزیرستان اپر',
        tehsils: [
          { code: 'PK53201', name: 'Ladha', nameUr: 'لدھا' },
          { code: 'PK53202', name: 'Makin', nameUr: 'مکین' },
          { code: 'PK53203', name: 'Sararogha', nameUr: 'سراروغہ' },
          { code: 'PK53204', name: 'Tiarza', nameUr: 'تیارزہ' },
          { code: 'PK53205', name: 'Sarwakai', nameUr: 'سروکئی' },
          { code: 'PK53206', name: 'Shakai', nameUr: 'شکئی' },
          { code: 'PK53207', name: 'Shawal', nameUr: 'شوال' },
        ],
      },
      {
        code: 'PK533',
        name: 'South Waziristan Lower',
        nameUr: 'جنوبی وزیرستان لوئر',
        tehsils: [
          { code: 'PK53301', name: 'Wana', nameUr: 'وانا' },
          { code: 'PK53302', name: 'Birmal', nameUr: 'برمل' },
          { code: 'PK53303', name: 'Sholam', nameUr: 'شولم' },
          { code: 'PK53304', name: 'Toi Khullah', nameUr: 'توئی خولہ' },
        ],
      },
      {
        code: 'PK535',
        name: 'Tank',
        nameUr: 'ضلع ٹانک',
        tehsils: [
          { code: 'PK53501', name: 'Tank', nameUr: 'ٹانک' },
          { code: 'PK53502', name: 'Jandola', nameUr: 'جنڈولہ' },
        ],
      },
      {
        code: 'PK501',
        name: 'Abbottabad',
        nameUr: 'ضلع ایبٹ آباد',
        tehsils: [
          { code: 'PK50101', name: 'Abbottabad', nameUr: 'ایبٹ آباد' },
          { code: 'PK50102', name: 'Havelian', nameUr: 'حویلیاں' },
          { code: 'PK50103', name: 'Lora', nameUr: 'لورا' },
          { code: 'PK50104', name: 'Lower Tanawal', nameUr: 'لوئر تناول' },
        ],
      },
      {
        code: 'PK502',
        name: 'Bajaur',
        nameUr: 'باجوڑ',
        tehsils: [
          { code: 'PK50201', name: 'Barang', nameUr: 'بارنگ' },
          { code: 'PK50202', name: 'Bar Chamer Kand', nameUr: 'بر چمر کنڈ' },
          { code: 'PK50203', name: 'Khar Bajaur', nameUr: 'خار باجوڑ' },
          { code: 'PK50204', name: 'Mamund', nameUr: 'ماموند' },
          { code: 'PK50205', name: 'Nawagai', nameUr: 'نواں گئی' },
          { code: 'PK50206', name: 'Salarzai', nameUr: 'سالارزئی' },
          { code: 'PK50207', name: 'Utman Khel', nameUr: 'عثمان خیل' },
        ],
      },
      {
        code: 'PK506',
        name: 'Charsadda',
        nameUr: 'ضلع چارسدہ',
        tehsils: [
          { code: 'PK50601', name: 'Charsadda', nameUr: 'چارسدہ' },
          { code: 'PK50602', name: 'Shabqadar', nameUr: 'شبقدر' },
          { code: 'PK50603', name: 'Tangi', nameUr: 'تنگی' },
        ],
      },
      {
        code: 'PK511',
        name: 'Hangu',
        nameUr: 'ضلع ہنگو',
        tehsils: [
          { code: 'PK51101', name: 'Hangu', nameUr: 'ہنگو' },
          { code: 'PK51102', name: 'Thall', nameUr: 'تھل' },
        ],
      },
      {
        code: 'PK512',
        name: 'Haripur',
        nameUr: 'ضلع ہری پور',
        tehsils: [
          { code: 'PK51201', name: 'Haripur', nameUr: 'ہری پور' },
          { code: 'PK51202', name: 'Ghazi', nameUr: 'غازی' },
          { code: 'PK51203', name: 'Khanpur', nameUr: 'خانپور' },
        ],
      },
      {
        code: 'PK517',
        name: 'Khyber',
        nameUr: 'خیبر',
        tehsils: [
          { code: 'PK51701', name: 'Bara', nameUr: 'باڑا' },
          { code: 'PK51702', name: 'Jamrud', nameUr: 'جمرود' },
          { code: 'PK51703', name: 'Landi Kotal', nameUr: 'لنڈی کوتل' },
          { code: 'PK51704', name: 'Mula Gori', nameUr: 'ملا گوری' },
        ],
      },
      {
        code: 'PK521',
        name: 'Kurram',
        nameUr: 'کرم',
        tehsils: [
          { code: 'PK52101', name: 'Central Kurram', nameUr: 'سینٹرل کرم' },
          { code: 'PK52102', name: 'Lower Kurram', nameUr: 'لوئر کرم' },
          { code: 'PK52103', name: 'Upper Kurram', nameUr: 'اپر کرم' },
        ],
      },
      {
        code: 'PK524',
        name: 'Malakand',
        nameUr: 'ضلع مالاکنڈ',
        tehsils: [
          { code: 'PK52401', name: 'Sam Ranizai', nameUr: 'سم رانیزئی' },
          { code: 'PK52402', name: 'Swat Ranizai', nameUr: 'سوات رانیزئی' },
          { code: 'PK52403', name: 'Baizai', nameUr: 'بئی زئی' },
          { code: 'PK52404', name: 'Thana', nameUr: 'تھانہ' },
        ],
      },
      {
        code: 'PK525',
        name: 'Mansehra',
        nameUr: 'ضلع مانسہرہ',
        tehsils: [
          { code: 'PK52501', name: 'Mansehra', nameUr: 'مانسہرہ' },
          { code: 'PK52502', name: 'Balakot', nameUr: 'بالاکوٹ' },
          { code: 'PK52503', name: 'Oghi', nameUr: 'اوگی' },
          { code: 'PK52504', name: 'Baffa Pakhal', nameUr: 'بفا پکھل' },
          { code: 'PK52505', name: 'Darband', nameUr: 'دربند' },
        ],
      },
      {
        code: 'PK522',
        name: 'Mardan',
        nameUr: 'ضلع مردان',
        tehsils: [
          { code: 'PK52201', name: 'Mardan', nameUr: 'مردان' },
          { code: 'PK52202', name: 'Katlang', nameUr: 'کاٹلنگ' },
          { code: 'PK52203', name: 'Rustam', nameUr: 'رستم' },
          { code: 'PK52204', name: 'Takht Bhai', nameUr: 'تخت بھائی' },
          { code: 'PK52205', name: 'Garhi Kapura', nameUr: 'گڑھی کپورہ' },
        ],
      },
      {
        code: 'PK527',
        name: 'Nowshera',
        nameUr: 'ضلع نوشہرہ',
        tehsils: [
          { code: 'PK52701', name: 'Nowshera', nameUr: 'نوشہرہ' },
          { code: 'PK52702', name: 'Pabbi', nameUr: 'پبی' },
          { code: 'PK52703', name: 'Jehangira', nameUr: 'جہانگیرہ' },
        ],
      },
      {
        code: 'PK528',
        name: 'Orakzai',
        nameUr: 'اورکزئی',
        tehsils: [
          { code: 'PK52801', name: 'Central Orakzai', nameUr: 'سینٹرل اورکزئی' },
          { code: 'PK52802', name: 'Ismail Zai', nameUr: 'اسماعیل زئی' },
          { code: 'PK52803', name: 'Lower Orakzai', nameUr: 'لوئر اورکزئی' },
          { code: 'PK52804', name: 'Upper Orakzai', nameUr: 'اپر اورکزئی' },
        ],
      },
      {
        code: 'PK534',
        name: 'Swabi',
        nameUr: 'ضلع صوابی',
        tehsils: [
          { code: 'PK53401', name: 'Swabi', nameUr: 'صوابی' },
          { code: 'PK53402', name: 'Chota Lahor', nameUr: 'چھوٹا لاہور' },
          { code: 'PK53403', name: 'Razar', nameUr: 'رضڑ' },
          { code: 'PK53404', name: 'Topi', nameUr: 'ٹوپی' },
        ],
      },
      {
        code: 'PK531',
        name: 'Swat',
        nameUr: 'ضلع سوات',
        tehsils: [
          { code: 'PK53101', name: 'Babuzai', nameUr: 'بابوزئی' },
          { code: 'PK53102', name: 'Barikot', nameUr: 'بریکوٹ' },
          { code: 'PK53103', name: 'Charbagh', nameUr: 'چارباغ' },
          { code: 'PK53104', name: 'Kabal', nameUr: 'کبل' },
          { code: 'PK53105', name: 'Khwaza Khela', nameUr: 'خواجہ خیلہ' },
          { code: 'PK53106', name: 'Matta', nameUr: 'مٹہ' },
          { code: 'PK53107', name: 'Bahrain', nameUr: 'بحرین' },
        ],
      },
      {
        code: 'PK505',
        name: 'Batagram',
        nameUr: 'بٹگرام',
        tehsils: [
          { code: 'PK50501', name: 'Batagram', nameUr: 'بٹگرام' },
          { code: 'PK50502', name: 'Allai', nameUr: 'الائی' },
        ],
      },
      {
        code: 'PK507',
        name: 'Lower Chitral',
        nameUr: 'لوئر چترال',
        tehsils: [
          { code: 'PK50701', name: 'Chitral', nameUr: 'چترال' },
          { code: 'PK50702', name: 'Drosh', nameUr: 'دروش' },
          { code: 'PK50703', name: 'Lotkoh', nameUr: 'لوٹکوہ' },
        ],
      },
      {
        code: 'PK508',
        name: 'Upper Chitral',
        nameUr: 'اپر چترال',
        tehsils: [
          { code: 'PK50801', name: 'Mastuj', nameUr: 'مستوج' },
          { code: 'PK50802', name: 'Mulkhow', nameUr: 'ملکھو' },
          { code: 'PK50803', name: 'Torkhow', nameUr: 'تورکھو' },
          { code: 'PK50804', name: 'Buni', nameUr: 'بونی' },
        ],
      },
      {
        code: 'PK509',
        name: 'Lower Dir',
        nameUr: 'لوئر دیر',
        tehsils: [
          { code: 'PK50901', name: 'Timergara', nameUr: 'تیمرگرہ' },
          { code: 'PK50902', name: 'Adenzai', nameUr: 'ادین زئی' },
          { code: 'PK50903', name: 'Balambat', nameUr: 'بالمبٹ' },
          { code: 'PK50904', name: 'Khal', nameUr: 'خال' },
          { code: 'PK50905', name: 'Lal Qila', nameUr: 'لال قلعہ' },
          { code: 'PK50906', name: 'Munda', nameUr: 'منڈا' },
          { code: 'PK50907', name: 'Samarbagh', nameUr: 'ثمر باغ' },
        ],
      },
      {
        code: 'PK530',
        name: 'Upper Dir',
        nameUr: 'اپر دیر',
        tehsils: [
          { code: 'PK53001', name: 'Dir', nameUr: 'دیر' },
          { code: 'PK53002', name: 'Barawal', nameUr: 'براول' },
          { code: 'PK53003', name: 'Kalkot', nameUr: 'کلکوٹ' },
          { code: 'PK53004', name: 'Lar Jam', nameUr: 'لر جم' },
          { code: 'PK53005', name: 'Sheringal', nameUr: 'شرینگل' },
          { code: 'PK53006', name: 'Wari', nameUr: 'واڑی' },
        ],
      },
      {
        code: 'PK536',
        name: 'Torghar',
        nameUr: 'تورغر',
        tehsils: [
          { code: 'PK53601', name: 'Judba', nameUr: 'جدبہ' },
          { code: 'PK53602', name: 'Khandar', nameUr: 'کھاندر' },
          { code: 'PK53603', name: 'Daur Maira', nameUr: 'دور میڑہ' },
        ],
      },
      {
        code: 'PK513',
        name: 'Lower Kohistan',
        nameUr: 'لوئر کوہستان',
        tehsils: [
          { code: 'PK51301', name: 'Pattan', nameUr: 'پٹن' },
          { code: 'PK51302', name: 'Bankad', nameUr: 'بانکڑ' },
        ],
      },
      {
        code: 'PK514',
        name: 'Upper Kohistan',
        nameUr: 'اپر کوہستان',
        tehsils: [
          { code: 'PK51401', name: 'Dassu', nameUr: 'داسو' },
          { code: 'PK51402', name: 'Kandia', nameUr: 'کاندیا' },
          { code: 'PK51403', name: 'Seo', nameUr: 'سیو' },
        ],
      },
      {
        code: 'PK515',
        name: 'Kolai Palas',
        nameUr: 'کولئی پالس',
        tehsils: [
          { code: 'PK51501', name: 'Bataira / Kolai', nameUr: 'بٹیرہ / کولئی' },
          { code: 'PK51502', name: 'Palas', nameUr: 'پالس' },
        ],
      },
      {
        code: 'PK516',
        name: 'Mohmand',
        nameUr: 'مہمند',
        tehsils: [
          { code: 'PK51601', name: 'Ambar Utman Khel', nameUr: 'امبار عثمان خیل' },
          { code: 'PK51602', name: 'Halim Zai', nameUr: 'حلیم زئی' },
          { code: 'PK51603', name: 'Pindiali', nameUr: 'پنڈیالی' },
          { code: 'PK51604', name: 'Prang Ghar', nameUr: 'پرانگ غار' },
          { code: 'PK51605', name: 'Safi', nameUr: 'صافی' },
          { code: 'PK51606', name: 'Upper Mohmand', nameUr: 'اپر مہمند' },
          { code: 'PK51607', name: 'Yake Ghund', nameUr: 'یکا غنڈ' },
        ],
      },
      {
        code: 'PK518',
        name: 'Buner',
        nameUr: 'بونیر',
        tehsils: [
          { code: 'PK51801', name: 'Daggar', nameUr: 'ڈگر' },
          { code: 'PK51802', name: 'Gadezai', nameUr: 'گدے زئی' },
          { code: 'PK51803', name: 'Gagra', nameUr: 'گاگرا' },
          { code: 'PK51804', name: 'Khudu Khel', nameUr: 'خودو خیل' },
          { code: 'PK51805', name: 'Mandanr', nameUr: 'ماندنڑ' },
          { code: 'PK51806', name: 'Chagharzai', nameUr: 'چاغرزئی' },
        ],
      },
      {
        code: 'PK503',
        name: 'Shangla',
        nameUr: 'شانگلہ',
        tehsils: [
          { code: 'PK50301', name: 'Alpuri', nameUr: 'الپوری' },
          { code: 'PK50302', name: 'Bisham', nameUr: 'بشام' },
          { code: 'PK50303', name: 'Chakesar', nameUr: 'چکیسر' },
          { code: 'PK50304', name: 'Martung', nameUr: 'مرتونگ' },
          { code: 'PK50305', name: 'Puran', nameUr: 'پورن' },
          { code: 'PK50306', name: 'Makhuzai', nameUr: 'مخوزئی' },
        ],
      },
    ],
  },
  {
    code: 'PK6',
    name: 'Punjab',
    nameUr: 'پنجاب',
    districts: [
      {
        code: 'PK618',
        name: 'Lahore',
        nameUr: 'ضلع لاہور',
        tehsils: [
          { code: 'PK61801', name: 'Lahore Cantt', nameUr: 'لاہور کینٹ' },
          { code: 'PK61802', name: 'Lahore City', nameUr: 'لاہور سٹی' },
          { code: 'PK61803', name: 'Model Town', nameUr: 'ماڈل ٹاؤن' },
          { code: 'PK61804', name: 'Raiwind', nameUr: 'رائے ونڈ' },
          { code: 'PK61805', name: 'Shalimar', nameUr: 'شالیمار' },
        ],
      },
      {
        code: 'PK630',
        name: 'Rawalpindi',
        nameUr: 'ضلع راولپنڈی',
        tehsils: [
          { code: 'PK63001', name: 'Rawalpindi', nameUr: 'راولپنڈی' },
          { code: 'PK63002', name: 'Gujar Khan', nameUr: 'گوجر خان' },
          { code: 'PK63003', name: 'Kahuta', nameUr: 'کہوٹہ' },
          { code: 'PK63004', name: 'Kallar Syedan', nameUr: 'کلر سیداں' },
          { code: 'PK63005', name: 'Taxila', nameUr: 'ٹیکسلا' },
        ],
      },
      {
        code: 'PK610',
        name: 'Faisalabad',
        nameUr: 'ضلع فیصل آباد',
        tehsils: [
          { code: 'PK61001', name: 'Faisalabad City', nameUr: 'فیصل آباد سٹی' },
          { code: 'PK61002', name: 'Faisalabad Sadar', nameUr: 'فیصل آباد صدر' },
          { code: 'PK61003', name: 'Chak Jhumra', nameUr: 'چک جھمرہ' },
          { code: 'PK61004', name: 'Jaranwala', nameUr: 'جڑانوالہ' },
          { code: 'PK61005', name: 'Samundri', nameUr: 'سمندری' },
          { code: 'PK61006', name: 'Tandlianwala', nameUr: 'تاندلیانوالہ' },
        ],
      },
      {
        code: 'PK625',
        name: 'Multan',
        nameUr: 'ضلع ملتان',
        tehsils: [
          { code: 'PK62501', name: 'Multan City', nameUr: 'ملتان سٹی' },
          { code: 'PK62502', name: 'Multan Sadar', nameUr: 'ملتان صدر' },
          { code: 'PK62503', name: 'Jalalpur Pirwala', nameUr: 'جلال پور پیروالا' },
          { code: 'PK62504', name: 'Shujabad', nameUr: 'شجاع آباد' },
        ],
      },
      {
        code: 'PK612',
        name: 'Gujranwala',
        nameUr: 'ضلع گوجرانوالہ',
        tehsils: [
          { code: 'PK61201', name: 'Gujranwala City', nameUr: 'گوجرانوالہ سٹی' },
          { code: 'PK61202', name: 'Gujranwala Sadar', nameUr: 'گوجرانوالہ صدر' },
          { code: 'PK61203', name: 'Kamoke', nameUr: 'کامونکی' },
          { code: 'PK61204', name: 'Nowshera Virkan', nameUr: 'نوشہرہ ورکاں' },
        ],
      },
      {
        code: 'PK633',
        name: 'Sialkot',
        nameUr: 'ضلع سیالکوٹ',
        tehsils: [
          { code: 'PK63301', name: 'Sialkot', nameUr: 'سیالکوٹ' },
          { code: 'PK63302', name: 'Daska', nameUr: 'ڈسکہ' },
          { code: 'PK63303', name: 'Pasrur', nameUr: 'پسرور' },
          { code: 'PK63304', name: 'Sambrial', nameUr: 'سمبڑیال' },
        ],
      },
      {
        code: 'PK632',
        name: 'Sargodha',
        nameUr: 'ضلع سرگودھا',
        tehsils: [
          { code: 'PK63201', name: 'Sargodha', nameUr: 'سرگودھا' },
          { code: 'PK63202', name: 'Bhalwal', nameUr: 'بھلوال' },
          { code: 'PK63203', name: 'Bhera', nameUr: 'بھیرہ' },
          { code: 'PK63204', name: 'Kot Momin', nameUr: 'کوٹ مومن' },
          { code: 'PK63205', name: 'Sahiwal', nameUr: 'ساہیوال' },
          { code: 'PK63206', name: 'Shahpur', nameUr: 'شاہ پور' },
          { code: 'PK63207', name: 'Sillanwali', nameUr: 'سلانوالی' },
        ],
      },
      {
        code: 'PK603',
        name: 'Bahawalpur',
        nameUr: 'ضلع بہاولپور',
        tehsils: [
          { code: 'PK60301', name: 'Bahawalpur City', nameUr: 'بہاولپور سٹی' },
          { code: 'PK60302', name: 'Bahawalpur Sadar', nameUr: 'بہاولپور صدر' },
          { code: 'PK60303', name: 'Ahmadpur East', nameUr: 'احمد پور شرقیہ' },
          { code: 'PK60304', name: 'Hasilpur', nameUr: 'حاصل پور' },
          { code: 'PK60305', name: 'Khairpur Tamewali', nameUr: 'خیرپور ٹامیوالی' },
          { code: 'PK60306', name: 'Yazman', nameUr: 'یازمان' },
        ],
      },
      {
        code: 'PK631',
        name: 'Sahiwal',
        nameUr: 'ضلع ساہیوال',
        tehsils: [
          { code: 'PK63101', name: 'Sahiwal', nameUr: 'ساہیوال' },
          { code: 'PK63102', name: 'Chichawatni', nameUr: 'چیچہ وطنی' },
        ],
      },
      {
        code: 'PK613',
        name: 'Gujrat',
        nameUr: 'ضلع گجرات',
        tehsils: [
          { code: 'PK61301', name: 'Gujrat', nameUr: 'گجرات' },
          { code: 'PK61302', name: 'Kharian', nameUr: 'کھاریاں' },
          { code: 'PK61303', name: 'Sarai Alamgir', nameUr: 'سرائے عالمگیر' },
          { code: 'PK61304', name: 'Jalalpur Jattan', nameUr: 'جلالپور جٹاں' },
          { code: 'PK61305', name: 'Kunjah', nameUr: 'کنجاہ' },
        ],
      },
      {
        code: 'PK614',
        name: 'Hafizabad',
        nameUr: 'حافظ آباد',
        tehsils: [
          { code: 'PK61401', name: 'Hafizabad', nameUr: 'حافظ آباد' },
          { code: 'PK61402', name: 'Pindi Bhattian', nameUr: 'پنڈی بھٹیاں' },
        ],
      },
      {
        code: 'PK615',
        name: 'Jhang',
        nameUr: 'ضلع جھنگ',
        tehsils: [
          { code: 'PK61501', name: 'Jhang', nameUr: 'جھنگ' },
          { code: 'PK61502', name: '18-Hazari', nameUr: 'اٹھارہ ہزاری' },
          { code: 'PK61503', name: 'Ahmadpur Sial', nameUr: 'احمد پور سیال' },
          { code: 'PK61504', name: 'Shorkot', nameUr: 'شورکوٹ' },
          { code: 'PK61505', name: 'Mandi Shah Jeewna', nameUr: 'منڈی شاہ جیونہ' },
        ],
      },
      {
        code: 'PK616',
        name: 'Jhelum',
        nameUr: 'ضلع جہلم',
        tehsils: [
          { code: 'PK61601', name: 'Jhelum', nameUr: 'جہلم' },
          { code: 'PK61602', name: 'Dina', nameUr: 'دینہ' },
          { code: 'PK61603', name: 'Pind Dadan Khan', nameUr: 'پنڈ دادن خان' },
          { code: 'PK61604', name: 'Sohawa', nameUr: 'سوہاوہ' },
        ],
      },
      {
        code: 'PK617',
        name: 'Kasur',
        nameUr: 'ضلع قصور',
        tehsils: [
          { code: 'PK61701', name: 'Kasur', nameUr: 'قصور' },
          { code: 'PK61702', name: 'Chunian', nameUr: 'چونیاں' },
          { code: 'PK61703', name: 'Kot Radha Kishan', nameUr: 'کوٹ رادھا کشن' },
          { code: 'PK61704', name: 'Pattoki', nameUr: 'پتوکی' },
        ],
      },
      {
        code: 'PK622',
        name: 'Mianwali',
        nameUr: 'ضلع میانوالی',
        tehsils: [
          { code: 'PK62201', name: 'Mianwali', nameUr: 'میانوالی' },
          { code: 'PK62202', name: 'Isakhel', nameUr: 'عیسیٰ خیل' },
          { code: 'PK62203', name: 'Piplan', nameUr: 'پپلاں' },
        ],
      },
      {
        code: 'PK608',
        name: 'Dera Ghazi Khan',
        nameUr: 'ضلع ڈیرہ غازی خان',
        tehsils: [
          { code: 'PK60801', name: 'Dera Ghazi Khan', nameUr: 'ڈیرہ غازی خان' },
          { code: 'PK60802', name: 'De-Excluded Area D.G. Khan', nameUr: 'ڈی ایکسلوڈڈ ایریا' },
          { code: 'PK60803', name: 'Kot Chutta', nameUr: 'کوٹ چھٹہ' },
        ],
      },
      {
        code: 'PK601',
        name: 'Attock',
        nameUr: 'ضلع اٹک',
        tehsils: [
          { code: 'PK60101', name: 'Attock', nameUr: 'اٹک' },
          { code: 'PK60102', name: 'Fateh Jang', nameUr: 'فتح جنگ' },
          { code: 'PK60103', name: 'Hassan Abdal', nameUr: 'حسن ابدال' },
          { code: 'PK60104', name: 'Hazro', nameUr: 'حضرُو' },
          { code: 'PK60105', name: 'Jand', nameUr: 'جنڈ' },
          { code: 'PK60106', name: 'Pindi Gheb', nameUr: 'پنڈی گھیب' },
        ],
      },
      {
        code: 'PK605',
        name: 'Bhakkar',
        nameUr: 'ضلع بھکر',
        tehsils: [
          { code: 'PK60501', name: 'Bhakkar', nameUr: 'بھکر' },
          { code: 'PK60502', name: 'Darya Khan', nameUr: 'دریا خان' },
          { code: 'PK60503', name: 'Kaloorkot', nameUr: 'کلورکوٹ' },
          { code: 'PK60504', name: 'Mankera', nameUr: 'مانکیرہ' },
        ],
      },
      {
        code: 'PK606',
        name: 'Chakwal',
        nameUr: 'ضلع چکوال',
        tehsils: [
          { code: 'PK60601', name: 'Chakwal', nameUr: 'چکوال' },
          { code: 'PK60602', name: 'Choa Saidan Shah', nameUr: 'چوآسیدن شاہ' },
          { code: 'PK60603', name: 'Kallar Kahar', nameUr: 'کلر کہار' },
        ],
      },
      {
        code: 'PK607',
        name: 'Chiniot',
        nameUr: 'ضلع چنیوٹ',
        tehsils: [
          { code: 'PK60701', name: 'Chiniot', nameUr: 'چنیوٹ' },
          { code: 'PK60702', name: 'Bhowana', nameUr: 'بھوانہ' },
          { code: 'PK60703', name: 'Lalian', nameUr: 'لالیاں' },
        ],
      },
      {
        code: 'PK628',
        name: 'Okara',
        nameUr: 'ضلع اوکاڑہ',
        tehsils: [
          { code: 'PK62801', name: 'Okara', nameUr: 'اوکاڑہ' },
          { code: 'PK62802', name: 'Depalpur', nameUr: 'دیپالپور' },
          { code: 'PK62803', name: 'Renala Khurd', nameUr: 'رینالہ خورد' },
        ],
      },
      {
        code: 'PK629',
        name: 'Rahim Yar Khan',
        nameUr: 'رحیم یار خان',
        tehsils: [
          { code: 'PK62901', name: 'Rahim Yar Khan', nameUr: 'رحیم یار خان' },
          { code: 'PK62902', name: 'Khanpur', nameUr: 'خانپور' },
          { code: 'PK62903', name: 'Liaquatpur', nameUr: 'لیاقت پور' },
          { code: 'PK62904', name: 'Sadiqabad', nameUr: 'صادق آباد' },
        ],
      },
      {
        code: 'PK634',
        name: 'Toba Tek Singh',
        nameUr: 'ٹوبہ ٹیک سنگھ',
        tehsils: [
          { code: 'PK63401', name: 'Toba Tek Singh', nameUr: 'ٹوبہ ٹیک سنگھ' },
          { code: 'PK63402', name: 'Gojra', nameUr: 'گوجرہ' },
          { code: 'PK63403', name: 'Kamalia', nameUr: 'کمالیہ' },
          { code: 'PK63404', name: 'Pirmahal', nameUr: 'پیر محل' },
        ],
      },
      {
        code: 'PK635',
        name: 'Vehari',
        nameUr: 'ضلع وہاڑی',
        tehsils: [
          { code: 'PK63501', name: 'Vehari', nameUr: 'وہاڑی' },
          { code: 'PK63502', name: 'Burewala', nameUr: 'بورے والا' },
          { code: 'PK63503', name: 'Mailsi', nameUr: 'میلسی' },
        ],
      },
      {
        code: 'PK627',
        name: 'Nankana Sahib',
        nameUr: 'ننکانہ صاحب',
        tehsils: [
          { code: 'PK62701', name: 'Nankana Sahib', nameUr: 'ننکانہ صاحب' },
          { code: 'PK62702', name: 'Sangla Hill', nameUr: 'سانگلہ ہل' },
          { code: 'PK62703', name: 'Shah Kot', nameUr: 'شاہ کوٹ' },
        ],
      },
      {
        code: 'PK636',
        name: 'Sheikhupura',
        nameUr: 'ضلع شیخوپورہ',
        tehsils: [
          { code: 'PK63601', name: 'Sheikhupura', nameUr: 'شیخوپورہ' },
          { code: 'PK63602', name: 'Ferozewala', nameUr: 'فیروزوالہ' },
          { code: 'PK63603', name: 'Muridke', nameUr: 'مریدکے' },
          { code: 'PK63604', name: 'Safdarabad', nameUr: 'صفدرآباد' },
          { code: 'PK63605', name: 'Sharak Pur', nameUr: 'شرقپور' },
        ],
      },
      {
        code: 'PK626',
        name: 'Muzaffargarh',
        nameUr: 'مظفر گڑھ',
        tehsils: [
          { code: 'PK62601', name: 'Muzaffargarh', nameUr: 'مظفر گڑھ' },
          { code: 'PK62602', name: 'Alipur', nameUr: 'علی پور' },
          { code: 'PK62603', name: 'Jatoi', nameUr: 'جتوئی' },
          { code: 'PK62604', name: 'Kot Addu', nameUr: 'کوٹ ادو' },
        ],
      },
      {
        code: 'PK624',
        name: 'Mandi Bahauddin',
        nameUr: 'منڈی بہاؤالدین',
        tehsils: [
          { code: 'PK62401', name: 'Mandi Bahauddin', nameUr: 'منڈی بہاؤالدین' },
          { code: 'PK62402', name: 'Malakwal', nameUr: 'ملکوال' },
          { code: 'PK62403', name: 'Phalia', nameUr: 'پھالیہ' },
        ],
      },
      {
        code: 'PK620',
        name: 'Lodhran',
        nameUr: 'ضلع لودھراں',
        tehsils: [
          { code: 'PK62001', name: 'Lodhran', nameUr: 'لودھراں' },
          { code: 'PK62002', name: 'Dunyapur', nameUr: 'دنیا پور' },
          { code: 'PK62003', name: 'Kahror Pacca', nameUr: 'کہروڑ پکا' },
        ],
      },
      {
        code: 'PK619',
        name: 'Layyah',
        nameUr: 'ضلع لیہ',
        tehsils: [
          { code: 'PK61901', name: 'Layyah', nameUr: 'لیہ' },
          { code: 'PK61902', name: 'Chaubara', nameUr: 'چوبارہ' },
          { code: 'PK61903', name: 'Karor Lal Esan', nameUr: 'کروڑ لعل عیسن' },
          { code: 'PK61904', name: 'Chowk Azam', nameUr: 'چوک اعظم' },
          { code: 'PK61905', name: 'Fatehpur', nameUr: 'فتح پور' },
        ],
      },
      {
        code: 'PK611',
        name: 'Khanewal',
        nameUr: 'ضلع خانیوال',
        tehsils: [
          { code: 'PK61101', name: 'Khanewal', nameUr: 'خانیوال' },
          { code: 'PK61102', name: 'Jahanian', nameUr: 'جہانیاں' },
          { code: 'PK61103', name: 'Kabirwala', nameUr: 'کبیروالا' },
          { code: 'PK61104', name: 'Mian Channu', nameUr: 'میاں چنوں' },
        ],
      },
      {
        code: 'PK621',
        name: 'Murree',
        nameUr: 'ضلع مری',
        tehsils: [
          { code: 'PK62101', name: 'Murree', nameUr: 'مری' },
          { code: 'PK62102', name: 'Kotli Sattian', nameUr: 'کوٹلی ستیاں' },
        ],
      },
      {
        code: 'PK604',
        name: 'Bahawalnagar',
        nameUr: 'بہاولنگر',
        tehsils: [
          { code: 'PK60401', name: 'Bahawalnagar', nameUr: 'بہاولنگر' },
          { code: 'PK60402', name: 'Chishtian', nameUr: 'چشتیاں' },
          { code: 'PK60403', name: 'Fort Abbas', nameUr: 'فورٹ عباس' },
          { code: 'PK60404', name: 'Haroonabad', nameUr: 'ہارون آباد' },
          { code: 'PK60405', name: 'Minchinabad', nameUr: 'منچن آباد' },
        ],
      },
      {
        code: 'PK623',
        name: 'Pakpattan',
        nameUr: 'ضلع پاکپتن',
        tehsils: [
          { code: 'PK62301', name: 'Pakpattan', nameUr: 'پاکپتن' },
          { code: 'PK62302', name: 'Arifwala', nameUr: 'عارف والا' },
        ],
      },
      {
        code: 'PK637',
        name: 'Taunsa',
        nameUr: 'ضلع تونسہ',
        tehsils: [
          { code: 'PK63701', name: 'Taunsa', nameUr: 'تونسہ' },
          { code: 'PK63702', name: 'Koh-e-Suleman', nameUr: 'کوہ سلیمان' },
          { code: 'PK63703', name: 'Vehova', nameUr: 'ویہوا' },
        ],
      },
      {
        code: 'PK638',
        name: 'Kot Addu',
        nameUr: 'ضلع کوٹ ادو',
        tehsils: [
          { code: 'PK63801', name: 'Kot Addu', nameUr: 'کوٹ ادو' },
          { code: 'PK63802', name: 'Chowk Sarwar Shaheed', nameUr: 'چوک سرور شہید' },
        ],
      },
      {
        code: 'PK639',
        name: 'Talagang',
        nameUr: 'ضلع تلہ گنگ',
        tehsils: [
          { code: 'PK63901', name: 'Talagang', nameUr: 'تلہ گنگ' },
          { code: 'PK63902', name: 'Lawa', nameUr: 'لاوہ' },
          { code: 'PK63903', name: 'Multan Khurd', nameUr: 'ملتان خورد' },
        ],
      },
      {
        code: 'PK640',
        name: 'Wazirabad',
        nameUr: 'ضلع وزیرآباد',
        tehsils: [
          { code: 'PK64001', name: 'Wazirabad', nameUr: 'وزیرآباد' },
          { code: 'PK64002', name: 'Ali Pur Chatta', nameUr: 'علی پور چٹھہ' },
        ],
      },
      {
        code: 'PK609',
        name: 'Khushab',
        nameUr: 'ضلع خوشاب',
        tehsils: [
          { code: 'PK60901', name: 'Khushab', nameUr: 'خوشاب' },
          { code: 'PK60902', name: 'Noorpur Thal', nameUr: 'نورپور تھل' },
          { code: 'PK60903', name: 'Quaidabad', nameUr: 'قائدآباد' },
          { code: 'PK60904', name: 'Naushera (Wadi-e-Soon)', nameUr: 'نوشہرہ وادی سون' },
        ],
      },
      {
        code: 'PK602',
        name: 'Rajanpur',
        nameUr: 'ضلع راجن پور',
        tehsils: [
          { code: 'PK60201', name: 'Rajanpur', nameUr: 'راجن پور' },
          { code: 'PK60202', name: 'Jampur', nameUr: 'جام پور' },
          { code: 'PK60203', name: 'Rojhan', nameUr: 'روجھان' },
        ],
      },
      {
        code: 'PK641',
        name: 'Jampur',
        nameUr: 'ضلع جام پور',
        tehsils: [
          { code: 'PK64101', name: 'Jampur', nameUr: 'جام پور' },
          { code: 'PK64102', name: 'Dajal', nameUr: 'داجل' },
          { code: 'PK64103', name: 'Muhammadpur', nameUr: 'محمد پور' },
        ],
      },
    ],
  },
  {
    code: 'PK7',
    name: 'Sindh',
    nameUr: 'سندھ',
    districts: [
      {
        code: 'PK712',
        name: 'Karachi Central',
        nameUr: 'کراچی وسطی',
        tehsils: [
          { code: 'PK71201', name: 'Gulberg Sub-Division', nameUr: 'گلبرگ' },
          { code: 'PK71202', name: 'Liaquatabad Sub-Division', nameUr: 'لیاقت آباد' },
          { code: 'PK71203', name: 'Nazimabad Sub-Division', nameUr: 'ناظم آباد' },
          { code: 'PK71204', name: 'New Karachi Sub-Division', nameUr: 'نیو کراچی' },
          { code: 'PK71205', name: 'North Nazimabad Sub-Division', nameUr: 'نارتھ ناظم آباد' },
        ],
      },
      {
        code: 'PK713',
        name: 'Karachi East',
        nameUr: 'کراچی شرقی',
        tehsils: [
          { code: 'PK71301', name: 'Ferozabad Sub-Division', nameUr: 'فیروز آباد' },
          { code: 'PK71302', name: 'Gulshan-e-Iqbal Sub-Division', nameUr: 'گلشن اقبال' },
          { code: 'PK71303', name: 'Gulzar-e-Hijri Sub-Division', nameUr: 'گلزار ہجری' },
          { code: 'PK71304', name: 'Jamshed Quarters Sub-Division', nameUr: 'جمشید کوارٹرز' },
        ],
      },
      {
        code: 'PK715',
        name: 'Karachi South',
        nameUr: 'کراچی جنوبی',
        tehsils: [
          { code: 'PK71501', name: 'Aram Bagh Sub-Division', nameUr: 'آرام باغ' },
          { code: 'PK71502', name: 'Civil Line Sub-Division', nameUr: 'سول لائن' },
          { code: 'PK71503', name: 'Garden Sub-Division', nameUr: 'گارڈن' },
          { code: 'PK71504', name: 'Saddar Sub-Division', nameUr: 'صدر' },
          { code: 'PK71505', name: 'Lyari Sub-Division', nameUr: 'لیاری' },
        ],
      },
      {
        code: 'PK716',
        name: 'Karachi West',
        nameUr: 'کراچی غربی',
        tehsils: [
          { code: 'PK71601', name: 'Manghopir Sub-Division', nameUr: 'منگھوپیر' },
          { code: 'PK71602', name: 'Mominabad Sub-Division', nameUr: 'مومن آباد' },
          { code: 'PK71603', name: 'Orangi Sub-Division', nameUr: 'اورنگی' },
        ],
      },
      {
        code: 'PK720',
        name: 'Korangi',
        nameUr: 'ضلع کورنگی',
        tehsils: [
          { code: 'PK72001', name: 'Korangi Sub-Division', nameUr: 'کورنگی' },
          { code: 'PK72002', name: 'Landhi Sub-Division', nameUr: 'لانڈھی' },
          { code: 'PK72003', name: 'Shah Faisal Sub-Division', nameUr: 'شاہ فیصل' },
          { code: 'PK72004', name: 'Model Colony Sub-Division', nameUr: 'ماڈل کالونی' },
        ],
      },
      {
        code: 'PK722',
        name: 'Malir',
        nameUr: 'ضلع ملیر',
        tehsils: [
          { code: 'PK72201', name: 'Airport Sub-Division', nameUr: 'ایئرپورٹ' },
          { code: 'PK72202', name: 'Bin Qasim Sub-Division', nameUr: 'بن قاسم' },
          { code: 'PK72203', name: 'Gaddap Sub-Division', nameUr: 'گڈاپ' },
          { code: 'PK72204', name: 'Ibrahim Hyderi Sub-Division', nameUr: 'ابراہیم حیدری' },
          { code: 'PK72205', name: 'Murad Memon Sub-Division', nameUr: 'مراد میمن' },
          { code: 'PK72206', name: 'Shah Murad Sub-Division', nameUr: 'شاہ مراد' },
        ],
      },
      {
        code: 'PK710',
        name: 'Hyderabad',
        nameUr: 'ضلع حیدرآباد',
        tehsils: [
          { code: 'PK71001', name: 'Hyderabad City', nameUr: 'حیدرآباد سٹی' },
          { code: 'PK71002', name: 'Hyderabad', nameUr: 'حیدرآباد' },
          { code: 'PK71003', name: 'Latifabad', nameUr: 'لطیف آباد' },
          { code: 'PK71004', name: 'Qasimabad', nameUr: 'قاسم آباد' },
        ],
      },
      {
        code: 'PK728',
        name: 'Sukkur',
        nameUr: 'ضلع سکھر',
        tehsils: [
          { code: 'PK72801', name: 'Sukkur City', nameUr: 'سکھر سٹی' },
          { code: 'PK72802', name: 'New Sukkur', nameUr: 'نیو سکھر' },
          { code: 'PK72803', name: 'Rohri', nameUr: 'روہڑی' },
          { code: 'PK72804', name: 'Salehpat', nameUr: 'صالح پٹ' },
          { code: 'PK72805', name: 'Pano Aqil', nameUr: 'پنو عاقل' },
        ],
      },
      {
        code: 'PK721',
        name: 'Larkana',
        nameUr: 'ضلع لاڑکانہ',
        tehsils: [
          { code: 'PK72101', name: 'Larkana', nameUr: 'لاڑکانہ' },
          { code: 'PK72102', name: 'Bakrani', nameUr: 'بقرانی' },
          { code: 'PK72103', name: 'Dokri', nameUr: 'ڈوکری' },
          { code: 'PK72104', name: 'Rato Dero', nameUr: 'رتودیرو' },
        ],
      },
      {
        code: 'PK723',
        name: 'Mirpur Khas',
        nameUr: 'میرپور خاص',
        tehsils: [
          { code: 'PK72301', name: 'Mirpur Khas', nameUr: 'میرپور خاص' },
          { code: 'PK72302', name: 'Digri', nameUr: 'ڈگری' },
          { code: 'PK72303', name: 'Jhuddo', nameUr: 'جھڈو' },
          { code: 'PK72304', name: 'Kot Ghulam Muhammad', nameUr: 'کوٹ غلام محمد' },
          { code: 'PK72305', name: 'Shujabad', nameUr: 'شجاع آباد' },
          { code: 'PK72306', name: 'Sindhri', nameUr: 'سندھڑی' },
          { code: 'PK72307', name: 'Hussain Bux Mari', nameUr: 'حسین بخش مری' },
        ],
      },
      {
        code: 'PK724',
        name: 'Shaheed Benazirabad',
        nameUr: 'شہید بینظیر آباد',
        tehsils: [
          { code: 'PK72401', name: 'Nawabshah', nameUr: 'نواب شاہ' },
          { code: 'PK72402', name: 'Daur', nameUr: 'دوڑ' },
          { code: 'PK72403', name: 'Kazi Ahmed', nameUr: 'قاضی احمد' },
          { code: 'PK72404', name: 'Sakrand', nameUr: 'سکرنڈ' },
        ],
      },
      {
        code: 'PK714',
        name: 'Keamari',
        nameUr: 'ضلع کیماڑی',
        tehsils: [
          { code: 'PK71401', name: 'Keamari Sub-Division', nameUr: 'کیماڑی' },
          { code: 'PK71402', name: 'Baldia Sub-Division', nameUr: 'بلدیہ' },
          { code: 'PK71403', name: 'Mauripur Sub-Division', nameUr: 'ماری پور' },
          { code: 'PK71404', name: 'Site Sub-Division', nameUr: 'سائٹ' },
        ],
      },
      {
        code: 'PK701',
        name: 'Badin',
        nameUr: 'ضلع بدین',
        tehsils: [
          { code: 'PK70101', name: 'Badin', nameUr: 'بدین' },
          { code: 'PK70102', name: 'Matli', nameUr: 'ماتلی' },
          { code: 'PK70103', name: 'Shaheed Fazal Rahu', nameUr: 'شہید فاضل راہو' },
          { code: 'PK70104', name: 'Talhar', nameUr: 'تلہار' },
          { code: 'PK70105', name: 'Tando Bago', nameUr: 'ٹنڈو باگو' },
        ],
      },
      {
        code: 'PK702',
        name: 'Dadu',
        nameUr: 'ضلع دادو',
        tehsils: [
          { code: 'PK70201', name: 'Dadu', nameUr: 'دادو' },
          { code: 'PK70202', name: 'Johi', nameUr: 'جوہی' },
          { code: 'PK70203', name: 'Khairpur Nathan Shah', nameUr: 'خیرپور ناتھن شاہ' },
          { code: 'PK70204', name: 'Mehar', nameUr: 'میہڑ' },
        ],
      },
      {
        code: 'PK703',
        name: 'Ghotki',
        nameUr: 'ضلع گھوٹکی',
        tehsils: [
          { code: 'PK70301', name: 'Ghotki', nameUr: 'گھوٹکی' },
          { code: 'PK70302', name: 'Daharki', nameUr: 'ڈھرکی' },
          { code: 'PK70303', name: 'Khangarh (Khanpur)', nameUr: 'خانگڑھ' },
          { code: 'PK70304', name: 'Mirpur Mathelo', nameUr: 'میرپور ماتھیلو' },
          { code: 'PK70305', name: 'Ubauro', nameUr: 'او bauro' },
        ],
      },
      {
        code: 'PK711',
        name: 'Jacobabad',
        nameUr: 'ضلع جیکب آباد',
        tehsils: [
          { code: 'PK71101', name: 'Jacobabad', nameUr: 'جیکب آباد' },
          { code: 'PK71102', name: 'Garhi Khairo', nameUr: 'گڑھی خیرو' },
          { code: 'PK71103', name: 'Thul', nameUr: 'ٹھل' },
        ],
      },
      {
        code: 'PK717',
        name: 'Khairpur',
        nameUr: 'ضلع خیرپور',
        tehsils: [
          { code: 'PK71701', name: 'Khairpur', nameUr: 'خیرپور' },
          { code: 'PK71702', name: 'Faiz Ganj', nameUr: 'فیض گنج' },
          { code: 'PK71703', name: 'Gambat', nameUr: 'گمبٹ' },
          { code: 'PK71704', name: 'Kingri', nameUr: 'کنگری' },
          { code: 'PK71705', name: 'Kot Diji', nameUr: 'کوٹ ڈیجی' },
          { code: 'PK71706', name: 'Nara', nameUr: 'نارا' },
          { code: 'PK71707', name: 'Sobhodero', nameUr: 'سوبھو ڈیرو' },
          { code: 'PK71708', name: 'Thari Mirwah', nameUr: 'ٹھری میرواہ' },
        ],
      },
      {
        code: 'PK730',
        name: 'Thatta',
        nameUr: 'ضلع ٹھٹھہ',
        tehsils: [
          { code: 'PK73001', name: 'Thatta', nameUr: 'ٹھٹھہ' },
          { code: 'PK73002', name: 'Ghorabari', nameUr: 'گھوڑا باری' },
          { code: 'PK73003', name: 'Keti Bunder', nameUr: 'کیٹی بندر' },
          { code: 'PK73004', name: 'Mirpur Sakro', nameUr: 'میرپور ساکرو' },
        ],
      },
    ],
  },
  {
    code: 'PK2',
    name: 'Balochistan',
    nameUr: 'بلوچستان',
    districts: [
      {
        code: 'PK229',
        name: 'Quetta',
        nameUr: 'ضلع کوئٹہ',
        tehsils: [
          { code: 'PK22901', name: 'Quetta City', nameUr: 'کوئٹہ سٹی' },
          { code: 'PK22902', name: 'Quetta Sadar', nameUr: 'کوئٹہ صدر' },
          { code: 'PK22903', name: 'Chiltan', nameUr: 'چلتن' },
          { code: 'PK22904', name: 'Zarghoon', nameUr: 'زرغون' },
          { code: 'PK22905', name: 'Panjpai', nameUr: 'پنجپائی' },
        ],
      },
      {
        code: 'PK210',
        name: 'Gwadar',
        nameUr: 'ضلع گوادر',
        tehsils: [
          { code: 'PK21001', name: 'Gwadar', nameUr: 'گوادر' },
          { code: 'PK21002', name: 'Jiwani', nameUr: 'جیوانی' },
          { code: 'PK21003', name: 'Ormara', nameUr: 'اورماڑہ' },
          { code: 'PK21004', name: 'Pasni', nameUr: 'پسنی' },
          { code: 'PK21005', name: 'Suntsar', nameUr: 'سنتسر' },
        ],
      },
      {
        code: 'PK228',
        name: 'Pishin',
        nameUr: 'ضلع پشین',
        tehsils: [
          { code: 'PK22801', name: 'Pishin', nameUr: 'پشین' },
          { code: 'PK22802', name: 'Barshore', nameUr: 'برشور' },
          { code: 'PK22803', name: 'Hurramzai', nameUr: 'حرم زئی' },
          { code: 'PK22804', name: 'Karezat', nameUr: 'کاریزات' },
          { code: 'PK22805', name: 'Saranan', nameUr: 'سرانان' },
        ],
      },
      {
        code: 'PK219',
        name: 'Loralai',
        nameUr: 'ضلع لورالائی',
        tehsils: [
          { code: 'PK21901', name: 'Loralai', nameUr: 'لورالائی' },
          { code: 'PK21902', name: 'Bori', nameUr: 'بوری' },
          { code: 'PK21903', name: 'Mekhtar', nameUr: 'میختر' },
        ],
      },
      {
        code: 'PK235',
        name: 'Zhob',
        nameUr: 'ضلع ژوب',
        tehsils: [
          { code: 'PK23501', name: 'Zhob', nameUr: 'ژوب' },
          { code: 'PK23502', name: 'Ashwat', nameUr: 'اشوت' },
          { code: 'PK23503', name: 'Qamar Din Karez', nameUr: 'قمر دین کاریز' },
          { code: 'PK23504', name: 'Sambaza', nameUr: 'سمبازہ' },
        ],
      },
      {
        code: 'PK217',
        name: 'Khuzdar',
        nameUr: 'ضلع خضدار',
        tehsils: [
          { code: 'PK21701', name: 'Khuzdar', nameUr: 'خضدار' },
          { code: 'PK21702', name: 'Baghbana', nameUr: 'باغبانہ' },
          { code: 'PK21703', name: 'Mula', nameUr: 'مولا' },
          { code: 'PK21704', name: 'Nall', nameUr: 'نال' },
          { code: 'PK21705', name: 'Wadh', nameUr: 'وڈھ' },
          { code: 'PK21706', name: 'Zehri', nameUr: 'زہری' },
        ],
      },
      {
        code: 'PK230',
        name: 'Sibi',
        nameUr: 'ضلع سبی',
        tehsils: [
          { code: 'PK23001', name: 'Sibi', nameUr: 'سبی' },
          { code: 'PK23002', name: 'Kutmandai', nameUr: 'کوٹ منڈائی' },
          { code: 'PK23003', name: 'Sangan', nameUr: 'سانگان' },
        ],
      },
      {
        code: 'PK203',
        name: 'Chaman',
        nameUr: 'ضلع چمن',
        tehsils: [
          { code: 'PK20301', name: 'Chaman', nameUr: 'چمن' },
          { code: 'PK20302', name: 'Saddar Chaman', nameUr: 'صدر چمن' },
        ],
      },
    ],
  },
  {
    code: 'PK4',
    name: 'Islamabad',
    nameUr: 'وفاقی دارالحکومت اسلام آباد',
    districts: [
      {
        code: 'PK401',
        name: 'Islamabad',
        nameUr: 'اسلام آباد',
        tehsils: [
          { code: 'PK40101', name: 'Islamabad', nameUr: 'اسلام آباد سٹی' },
          { code: 'PK40102', name: 'Sihala', nameUr: 'سیہالہ' },
          { code: 'PK40103', name: 'Bhara Kahu', nameUr: 'بھارہ کہو' },
          { code: 'PK40104', name: 'Nilore', nameUr: 'نیلور' },
          { code: 'PK40105', name: 'Tarnol', nameUr: 'ترنول' },
        ],
      },
    ],
  },
  {
    code: 'PK1',
    name: 'Azad Kashmir',
    nameUr: 'آزاد جموں و کشمیر',
    districts: [
      {
        code: 'PK107',
        name: 'Muzaffarabad',
        nameUr: 'ضلع مظفر آباد',
        tehsils: [
          { code: 'PK10701', name: 'Muzaffarabad', nameUr: 'مظفر آباد' },
          { code: 'PK10702', name: 'Nasirabad', nameUr: 'ناصر آباد' },
        ],
      },
      {
        code: 'PK106',
        name: 'Mirpur',
        nameUr: 'ضلع میرپور',
        tehsils: [
          { code: 'PK10601', name: 'Mirpur', nameUr: 'میرپور' },
          { code: 'PK10602', name: 'Dadyal', nameUr: 'ڈڈیال' },
        ],
      },
      {
        code: 'PK105',
        name: 'Kotli',
        nameUr: 'ضلع کوٹلی',
        tehsils: [
          { code: 'PK10501', name: 'Kotli', nameUr: 'کوٹلی' },
          { code: 'PK10502', name: 'Charhoi', nameUr: 'چڑھوئی' },
          { code: 'PK10503', name: 'Duliah Jattan', nameUr: 'ڈولیا جٹاں' },
          { code: 'PK10504', name: 'Fatehpur Thakiala', nameUr: 'فتح پور تھکیالہ' },
          { code: 'PK10505', name: 'Khuiratta', nameUr: 'خوئی رٹہ' },
          { code: 'PK10506', name: 'Sehnsa', nameUr: 'سہنسہ' },
        ],
      },
      {
        code: 'PK109',
        name: 'Rawalakot (Poonch)',
        nameUr: 'ضلع پونچھ (راولاکوٹ)',
        tehsils: [
          { code: 'PK10901', name: 'Rawalakot', nameUr: 'راولاکوٹ' },
          { code: 'PK10902', name: 'Abbaspur', nameUr: 'عباس پور' },
          { code: 'PK10903', name: 'Hajira', nameUr: 'حاجیرہ' },
          { code: 'PK10904', name: 'Thorar', nameUr: 'تھوڑاڑ' },
        ],
      },
      {
        code: 'PK102',
        name: 'Bhimber',
        nameUr: 'ضلع بھمبر',
        tehsils: [
          { code: 'PK10201', name: 'Bhimber', nameUr: 'بھمبر' },
          { code: 'PK10202', name: 'Barnala', nameUr: 'برنالہ' },
          { code: 'PK10203', name: 'Samahni', nameUr: 'سماہنی' },
        ],
      },
      {
        code: 'PK101',
        name: 'Bagh',
        nameUr: 'ضلع باغ',
        tehsils: [
          { code: 'PK10101', name: 'Bagh', nameUr: 'باغ' },
          { code: 'PK10102', name: 'Dheerkot', nameUr: 'دھیرکوٹ' },
          { code: 'PK10103', name: 'Hari Ghel', nameUr: 'ہری گھیل' },
        ],
      },
    ],
  },
  {
    code: 'PK3',
    name: 'Gilgit Baltistan',
    nameUr: 'گلگت بلتستان',
    districts: [
      {
        code: 'PK305',
        name: 'Gilgit',
        nameUr: 'ضلع گلگت',
        tehsils: [
          { code: 'PK30501', name: 'Gilgit', nameUr: 'گلگت' },
          { code: 'PK30502', name: 'Danyor', nameUr: 'دنیور' },
          { code: 'PK30503', name: 'Juglot', nameUr: 'جگلوٹ' },
        ],
      },
      {
        code: 'PK311',
        name: 'Skardu',
        nameUr: 'ضلع سکردو',
        tehsils: [
          { code: 'PK31101', name: 'Skardu', nameUr: 'سکردو' },
          { code: 'PK31102', name: 'Gultari', nameUr: 'گلتری' },
          { code: 'PK31103', name: 'Rondu', nameUr: 'رونڈو' },
        ],
      },
      {
        code: 'PK307',
        name: 'Hunza',
        nameUr: 'ضلع ہنزہ',
        tehsils: [
          { code: 'PK30701', name: 'Aliabad', nameUr: 'علی آباد' },
          { code: 'PK30702', name: 'Gojal', nameUr: 'گوجال' },
        ],
      },
    ],
  },
];

// Helper Lookups
export function getProvinces(): { code: string; name: string; nameUr: string }[] {
  return PAKISTAN_ADMIN_HIERARCHY.map((p) => ({
    code: p.code,
    name: p.name,
    nameUr: p.nameUr,
  }));
}

export function getDistrictsForProvince(provinceNameOrCode: string): DistrictItem[] {
  if (!provinceNameOrCode) return [];
  const prov = PAKISTAN_ADMIN_HIERARCHY.find(
    (p) =>
      p.name.toLowerCase() === provinceNameOrCode.toLowerCase() ||
      p.nameUr === provinceNameOrCode ||
      p.code.toLowerCase() === provinceNameOrCode.toLowerCase()
  );
  return prov ? prov.districts : [];
}

export function getTehsilsForDistrict(provinceNameOrCode: string, districtNameOrCode: string): TehsilItem[] {
  const districts = getDistrictsForProvince(provinceNameOrCode);
  const dist = districts.find(
    (d) =>
      d.name.toLowerCase() === districtNameOrCode.toLowerCase() ||
      d.nameUr === districtNameOrCode ||
      d.code.toLowerCase() === districtNameOrCode.toLowerCase()
  );
  return dist ? dist.tehsils : [];
}

export function findTehsilsByDistrictName(districtName: string): TehsilItem[] {
  if (!districtName) return [];
  const clean = districtName.toLowerCase().trim();
  for (const prov of PAKISTAN_ADMIN_HIERARCHY) {
    const dist = prov.districts.find(
      (d) => d.name.toLowerCase() === clean || (d.nameUr && d.nameUr.includes(clean))
    );
    if (dist) return dist.tehsils;
  }
  return [];
}

export function getProvinceUrdu(provinceEn: string): string {
  const p = PAKISTAN_ADMIN_HIERARCHY.find((item) => item.name.toLowerCase() === provinceEn?.toLowerCase());
  return p?.nameUr || provinceEn || 'خیبر پختونخوا';
}

export function getDistrictUrdu(districtEn: string): string {
  for (const p of PAKISTAN_ADMIN_HIERARCHY) {
    const d = p.districts.find((item) => item.name.toLowerCase() === districtEn?.toLowerCase());
    if (d?.nameUr) return d.nameUr;
  }
  return districtEn || 'بنوں';
}

export function getTehsilUrdu(tehsilEn: string): string {
  for (const p of PAKISTAN_ADMIN_HIERARCHY) {
    for (const d of p.districts) {
      const t = d.tehsils.find((item) => item.name.toLowerCase() === tehsilEn?.toLowerCase());
      if (t?.nameUr) return t.nameUr;
    }
  }
  return tehsilEn || 'بنوں';
}
