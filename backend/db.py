import os
import sqlite3

from config import Config

CATEGORY_PRODUCTS = {
    "Everyday": [
        "Paracetamol 500mg", "Crocin Advance", "Dolo 650", "ORS Sachets", "Antacid Gel", "Digene Tablets",
        "Gelusil Syrup", "Vicks Inhaler", "Cough Syrup", "Nasal Drops", "Pain Relief Spray", "Iodine Solution",
        "Cotton Roll", "Band-Aid Strips", "Dettol Antiseptic Liquid", "Savlon Liquid", "Hand Sanitizer",
        "Thermometer (Digital)", "Hot Water Bag", "Glucose Powder", "Energy Drink Sachet", "Fever Patch",
        "Eye Drops (Lubricant)", "Ear Drops", "Burn Ointment", "Headache Balm", "Pain Relief Gel",
        "Muscle Relaxant Tablet", "Antihistamine Tablet", "Basic First Aid Kit",
    ],
    "Vitamins": [
        "Vitamin C Tablets", "Vitamin D3 Capsules", "Vitamin B12 Tablets", "Multivitamin Tablets", "Zinc Tablets",
        "Calcium Tablets", "Iron Tablets", "Omega-3 Capsules", "Protein Powder", "Energy Booster Capsules",
        "Immunity Booster Syrup", "Fish Oil Capsules", "Magnesium Tablets", "Folic Acid Tablets", "Biotin Capsules",
        "Hair & Skin Vitamins", "Joint Health Supplements", "Antioxidant Capsules", "Kids Multivitamins",
        "Senior Citizen Multivitamins", "Ayurvedic Immunity Tablets", "Herbal Supplements", "Vitamin A Capsules",
        "Vitamin E Capsules", "Probiotic Capsules", "Whey Protein Sachets", "Glucosamine Tablets",
        "Calcium + D3 Combo", "Iron Syrup", "Immunity Gummies",
    ],
    "First Aid": [
        "Bandages", "Cotton Pads", "Sterile Gauze", "Medical Tape", "Antiseptic Cream", "Antiseptic Liquid",
        "Burn Cream", "Scissors (Medical)", "Tweezers", "Disposable Gloves", "Face Masks", "Digital Thermometer",
        "Ice Pack", "Pain Relief Spray", "Wound Cleaning Solution", "Antibiotic Ointment", "Crepe Bandage",
        "Adhesive Bandage Roll", "Alcohol Swabs", "ORS Packets", "Eye Wash Solution", "First Aid Box",
        "Finger Bandage", "Burn Dressing", "Hand Sanitizer", "Safety Pins", "Emergency Blanket",
        "Antifungal Cream", "Medical Scalpels", "Emergency Contact Card",
    ],
    "Personal Care": [
        "Face Wash", "Body Wash", "Shampoo", "Conditioner", "Hair Oil", "Hair Serum", "Face Cream",
        "Moisturizer", "Sunscreen Lotion", "Lip Balm", "Toothpaste", "Toothbrush", "Mouthwash", "Hand Wash",
        "Hand Cream", "Deodorant", "Perfume", "Shaving Cream", "Razor", "After Shave Lotion",
        "Anti-Dandruff Shampoo", "Hair Color", "Nail Cutter", "Cotton Buds", "Wet Wipes", "Facial Tissues",
        "Anti-Acne Cream", "Fairness Cream", "Body Lotion", "Foot Care Cream",
    ],
    "Baby Care": [
        "Baby Diapers", "Baby Wipes", "Baby Powder", "Baby Oil", "Baby Shampoo", "Baby Soap", "Baby Lotion",
        "Baby Feeding Bottle", "Baby Bottle Cleaner", "Baby Rash Cream", "Baby Toothbrush", "Baby Toothpaste",
        "Baby Food Cereal", "Baby Milk Formula", "Baby Feeding Spoon", "Baby Thermometer", "Baby Massage Oil",
        "Baby Wet Towels", "Baby Napkins", "Baby Cotton", "Baby Mosquito Repellent", "Baby Sunscreen",
        "Baby Nail Scissors", "Baby Bath Tub", "Baby Soft Towels", "Baby Face Cream", "Baby Colic Drops",
        "Baby Vitamin Drops", "Baby Herbal Oil", "Baby Skin Protection Cream",
    ],
    "Women Health": [
        "Sanitary Pads", "Menstrual Cups", "Panty Liners", "Period Pain Relief Tablets", "Iron Tablets",
        "Calcium Supplements", "Folic Acid Tablets", "Pregnancy Test Kit", "Prenatal Vitamins",
        "Postnatal Supplements", "Vaginal Wash", "Intimate Hygiene Wash", "Anti-Fungal Cream",
        "PCOS Supplements", "Hormonal Balance Tablets", "Iron Syrup", "Breast Care Cream", "Maternity Belt",
        "Stretch Mark Cream", "Lactation Support Capsules", "Menopause Supplements", "Urinary Health Tablets",
        "Vaginal Infection Tablets", "Period Heating Patch", "Pain Relief Gel", "Fertility Supplements",
        "Women Multivitamins", "Vitamin D3 Capsules", "Calcium + Iron Combo", "Intimate Wipes",
    ],
}

SATNA_PHARMACIES = [
    {
        "name": "Discount Medicine",
        "location": "Rewa Rd, Shakti Vihar, Jeevan Jyoti Colony, Satna, Madhya Pradesh 485001",
        "lat": 24.5794,
        "lng": 80.8320,
        "medicines_count": 0,
        "rating": 4.6,
        "phone": "088890 05654",
        "hours": "Open - Closes 10 pm",
        "areas_served": "Satna",
    },
    {
        "name": "Aarya Medical Store",
        "location": "JRCW+WRC, Hadbadpur, Satna, Madhya Pradesh 485001",
        "lat": 24.5760,
        "lng": 80.8350,
        "medicines_count": 0,
        "rating": 4.4,
        "phone": "",
        "hours": "Open 24 hours",
        "areas_served": "Satna",
    },
    {
        "name": "Rama Medical Hall-Pharmace",
        "location": "Hospital Rd, Pannilal Chowk Rd, Satna, Madhya Pradesh 485001",
        "lat": 24.5738,
        "lng": 80.8335,
        "medicines_count": 0,
        "rating": 4.5,
        "phone": "098931 81393",
        "hours": "Open - Closes 10 pm",
        "areas_served": "Rajasthan and nearby areas",
    },
    {
        "name": "Shri Ram Medical",
        "location": "Maihar Bypass Rd, Utaily, Satna, Madhya Pradesh 485001",
        "lat": 24.5905,
        "lng": 80.8441,
        "medicines_count": 0,
        "rating": 4.3,
        "phone": "099777 84224",
        "hours": "Open - Closes 10 pm",
        "areas_served": "Satna",
    },
    {
        "name": "Anay Medical Hall",
        "location": "Jagatdev Talab Rd, Pushpraj Colony, Jeevan Jyoti Colony, Satna, Madhya Pradesh 485001",
        "lat": 24.5822,
        "lng": 80.8280,
        "medicines_count": 0,
        "rating": 4.4,
        "phone": "088263 95406",
        "hours": "Open - Closes 9:30 pm",
        "areas_served": "Satna",
    },
    {
        "name": "Everest Medical",
        "location": "11, Rajendra Nagar Rd, Railway Colony, Satna, Madhya Pradesh 485001",
        "lat": 24.5683,
        "lng": 80.8406,
        "medicines_count": 0,
        "rating": 4.5,
        "phone": "083052 82055",
        "hours": "Open - Closes 10 pm",
        "areas_served": "Madhavgarh and nearby areas",
    },
]

CURATED_DISEASE_MEDICINES = {
    "Infectious Diseases": [
        ("Paracetamol", "Fever and mild pain relief"),
        ("Azithromycin", "Bacterial infection treatment"),
        ("Amoxicillin", "Bacterial respiratory and ENT infections"),
        ("Ciprofloxacin", "Bacterial gut and urinary infections"),
        ("Doxycycline", "Bacterial and atypical infection treatment"),
        ("Metronidazole", "Anaerobic and protozoal infections"),
        ("Cefixime", "Typhoid and bacterial infection treatment"),
        ("Ceftriaxone", "Severe bacterial infections"),
        ("Ofloxacin", "Bacterial intestinal and urinary infections"),
        ("Levofloxacin", "Respiratory and urinary bacterial infections"),
        ("ORS", "Dehydration in diarrhea and vomiting"),
        ("Zinc Sulphate", "Diarrhea recovery and immunity support"),
        ("Albendazole", "Deworming and parasite infection"),
        ("Ivermectin", "Parasitic infection treatment"),
        ("Acyclovir", "Herpes viral infection treatment"),
        ("Oseltamivir", "Influenza virus management"),
        ("Linezolid", "Resistant gram positive infections"),
        ("Clindamycin", "Skin, dental, and soft tissue infections"),
        ("Nitrofurantoin", "Urinary tract infection treatment"),
        ("Rifampicin", "Tuberculosis and select bacterial infections"),
    ],
    "Lifestyle Diseases": [
        ("Metformin", "Type 2 diabetes blood sugar control"),
        ("Glimepiride", "Type 2 diabetes blood sugar reduction"),
        ("Insulin", "Diabetes glucose control"),
        ("Amlodipine", "High blood pressure control"),
        ("Losartan", "Hypertension and kidney protection"),
        ("Telmisartan", "Blood pressure management"),
        ("Atenolol", "Blood pressure and heart rate control"),
        ("Atorvastatin", "High cholesterol reduction"),
        ("Rosuvastatin", "Cholesterol and cardiac risk reduction"),
        ("Aspirin (low dose)", "Blood thinner for heart risk"),
        ("Clopidogrel", "Anti-platelet for stroke and heart risk"),
        ("Hydrochlorothiazide", "Hypertension and fluid control"),
        ("Ramipril", "Hypertension and heart protection"),
        ("Bisoprolol", "Blood pressure and heart failure support"),
        ("Ezetimibe", "Cholesterol absorption reduction"),
    ],
    "Respiratory Diseases": [
        ("Salbutamol Inhaler", "Quick relief in asthma wheeze"),
        ("Budesonide Inhaler", "Airway inflammation control in asthma"),
        ("Formoterol", "Long acting bronchodilator for asthma and COPD"),
        ("Montelukast", "Allergic asthma prevention"),
        ("Levocetirizine", "Allergy symptom relief"),
        ("Cetirizine", "Allergy and itching relief"),
        ("Chlorpheniramine", "Cold and allergy symptom control"),
        ("Theophylline", "Bronchodilation in asthma and COPD"),
        ("Ambroxol", "Mucus thinning in productive cough"),
        ("Bromhexine", "Mucolytic for chest congestion"),
        ("Guaifenesin", "Expectorant for productive cough"),
        ("Fluticasone Nasal Spray", "Nasal allergy and rhinitis control"),
        ("Ipratropium", "Bronchodilation in COPD and asthma"),
        ("Prednisolone", "Severe airway inflammation control"),
        ("Dextromethorphan", "Dry cough suppression"),
    ],
    "Mental Health": [
        ("Alprazolam", "Short term anxiety and panic control"),
        ("Diazepam", "Anxiety, spasm, and seizure support"),
        ("Clonazepam", "Panic disorder and seizure control"),
        ("Escitalopram", "Depression and anxiety treatment"),
        ("Fluoxetine", "Depression and OCD management"),
        ("Sertraline", "Depression and anxiety disorders"),
        ("Amitriptyline", "Depression and neuropathic pain support"),
        ("Olanzapine", "Schizophrenia and bipolar symptom control"),
        ("Risperidone", "Psychosis and bipolar symptom control"),
        ("Lithium", "Mood stabilization in bipolar disorder"),
    ],
    "Nutritional Deficiency": [
        ("Iron Folic Acid (IFA)", "Iron deficiency anemia support"),
        ("Vitamin B12", "B12 deficiency and nerve health"),
        ("Vitamin C", "Immunity and antioxidant support"),
        ("Vitamin D3", "Bone and calcium absorption support"),
        ("Calcium Tablets", "Bone strength and calcium deficiency"),
        ("Multivitamins", "General nutrition supplementation"),
        ("Zinc Tablets", "Immunity and wound healing support"),
        ("Folic Acid", "Red blood cell and pregnancy support"),
        ("Protein Supplements", "Nutrition and muscle support"),
        ("Omega-3 Capsules", "Heart and brain health support"),
    ],
    "Skin Diseases": [
        ("Clotrimazole Cream", "Fungal skin infection treatment"),
        ("Ketoconazole Cream", "Fungal dermatitis treatment"),
        ("Mupirocin Ointment", "Bacterial skin infection treatment"),
        ("Betnovate (Betamethasone)", "Inflammatory skin condition relief"),
        ("Calamine Lotion", "Itching and rash soothing"),
        ("Permethrin Cream", "Scabies treatment"),
        ("Salicylic Acid", "Acne and keratolytic support"),
        ("Benzoyl Peroxide", "Acne bacteria and inflammation control"),
        ("Isotretinoin", "Severe acne treatment"),
        ("Fluconazole", "Fungal infection treatment"),
    ],
    "Women & Child Health": [
        ("Iron Syrup", "Pediatric and maternal anemia support"),
        ("Calcium Syrup", "Calcium support in children and women"),
        ("Folic Acid Tablets", "Pregnancy and anemia support"),
        ("Misoprostol", "Obstetric and gynecological use"),
        ("Oxytocin", "Labor and post-partum uterine support"),
        ("Oral Contraceptive Pills", "Birth control and cycle regulation"),
        ("Emergency Contraceptive (i-pill)", "Emergency pregnancy prevention"),
        ("Paracetamol Syrup", "Fever and pain relief in children"),
        ("Amoxicillin Syrup", "Pediatric bacterial infections"),
        ("Zinc Syrup", "Child diarrhea recovery support"),
    ],
    "Eye, Ear, ENT": [
        ("Ciprofloxacin Eye Drops", "Bacterial eye infection treatment"),
        ("Moxifloxacin Eye Drops", "Bacterial conjunctivitis treatment"),
        ("Carboxymethylcellulose Drops", "Dry eye lubrication"),
        ("Timolol Eye Drops", "Intraocular pressure control in glaucoma"),
        ("Ofloxacin Ear Drops", "Bacterial ear infection treatment"),
        ("Xylometazoline Nasal Drops", "Nasal congestion relief"),
        ("Oxymetazoline", "Nasal blockage relief"),
        ("Betadine Gargle", "Throat antiseptic gargle"),
        ("Ear Wax Softener Drops", "Ear wax dissolution support"),
        ("Antihistamine Eye Drops", "Allergic eye itching relief"),
    ],
}


def _resolve_db_path():
    url = Config.DATABASE_URL or "sqlite:///dev.db"
    if not url.startswith("sqlite:///"):
        raise ValueError("Only sqlite DATABASE_URL is supported in this setup.")

    raw_path = url.replace("sqlite:///", "", 1)
    if os.path.isabs(raw_path):
        return raw_path

    base_dir = os.path.dirname(os.path.abspath(__file__))
    return os.path.join(base_dir, raw_path)


def get_connection():
    conn = sqlite3.connect(_resolve_db_path())
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_connection()
    cur = conn.cursor()

    cur.executescript(
        """
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            phone_number TEXT UNIQUE NOT NULL,
            full_name TEXT,
            email TEXT,
            password TEXT,
            otp_code TEXT,
            is_verified INTEGER DEFAULT 0,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS pharmacies (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            location TEXT,
            lat REAL DEFAULT 28.6139,
            lng REAL DEFAULT 77.2090,
            is_approved INTEGER DEFAULT 1,
            medicines_count INTEGER DEFAULT 0,
            rating REAL DEFAULT 4.5,
            phone TEXT DEFAULT '',
            hours TEXT DEFAULT '',
            areas_served TEXT DEFAULT '',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS medicines (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            pharmacy_id INTEGER NOT NULL,
            category TEXT DEFAULT '',
            name TEXT NOT NULL,
            use_for TEXT DEFAULT '',
            strength TEXT DEFAULT '',
            unit TEXT DEFAULT 'strip',
            price REAL NOT NULL,
            mrp REAL DEFAULT 0,
            offer_text TEXT DEFAULT '',
            image_url TEXT DEFAULT '/medicine-placeholder.svg',
            available INTEGER DEFAULT 1,
            stock_qty INTEGER DEFAULT 10,
            FOREIGN KEY (pharmacy_id) REFERENCES pharmacies(id)
        );

        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_number TEXT UNIQUE NOT NULL,
            user_id INTEGER,
            pharmacy_id INTEGER,
            status TEXT DEFAULT 'pending',
            total_amount REAL DEFAULT 0,
            is_express INTEGER DEFAULT 0,
            delivery_address TEXT DEFAULT '',
            customer_phone TEXT DEFAULT '',
            customer_lat REAL,
            customer_lng REAL,
            distance_km REAL DEFAULT 0,
            distance_surcharge REAL DEFAULT 0,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (pharmacy_id) REFERENCES pharmacies(id)
        );

        CREATE TABLE IF NOT EXISTS order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER NOT NULL,
            medicine_id INTEGER NOT NULL,
            quantity INTEGER NOT NULL,
            unit_price REAL NOT NULL,
            FOREIGN KEY (order_id) REFERENCES orders(id),
            FOREIGN KEY (medicine_id) REFERENCES medicines(id)
        );

        CREATE TABLE IF NOT EXISTS deliveries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER NOT NULL,
            partner_name TEXT DEFAULT 'Partner',
            partner_phone TEXT DEFAULT '+91-9999999999',
            status TEXT DEFAULT 'assigned',
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (order_id) REFERENCES orders(id)
        );

        CREATE TABLE IF NOT EXISTS support_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            request_type TEXT NOT NULL,
            full_name TEXT NOT NULL,
            phone TEXT NOT NULL,
            preferred_time TEXT DEFAULT '',
            notes TEXT DEFAULT '',
            status TEXT DEFAULT 'pending',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
        """
    )

    # Lightweight migrations for existing local DBs.
    cur.execute("PRAGMA table_info(users)")
    user_columns = {row[1] for row in cur.fetchall()}
    if "email" not in user_columns:
        cur.execute("ALTER TABLE users ADD COLUMN email TEXT")
    if "password" not in user_columns:
        cur.execute("ALTER TABLE users ADD COLUMN password TEXT")
    cur.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_unique ON users(email) WHERE email IS NOT NULL")

    cur.execute("PRAGMA table_info(medicines)")
    medicine_columns = {row[1] for row in cur.fetchall()}
    if "category" not in medicine_columns:
        cur.execute("ALTER TABLE medicines ADD COLUMN category TEXT DEFAULT ''")
    if "use_for" not in medicine_columns:
        cur.execute("ALTER TABLE medicines ADD COLUMN use_for TEXT DEFAULT ''")
    if "mrp" not in medicine_columns:
        cur.execute("ALTER TABLE medicines ADD COLUMN mrp REAL DEFAULT 0")
    if "offer_text" not in medicine_columns:
        cur.execute("ALTER TABLE medicines ADD COLUMN offer_text TEXT DEFAULT ''")
    if "image_url" not in medicine_columns:
        cur.execute("ALTER TABLE medicines ADD COLUMN image_url TEXT DEFAULT '/medicine-placeholder.svg'")

    cur.execute("PRAGMA table_info(orders)")
    order_columns = {row[1] for row in cur.fetchall()}
    if "delivery_address" not in order_columns:
        cur.execute("ALTER TABLE orders ADD COLUMN delivery_address TEXT DEFAULT ''")
    if "customer_phone" not in order_columns:
        cur.execute("ALTER TABLE orders ADD COLUMN customer_phone TEXT DEFAULT ''")
    if "customer_lat" not in order_columns:
        cur.execute("ALTER TABLE orders ADD COLUMN customer_lat REAL")
    if "customer_lng" not in order_columns:
        cur.execute("ALTER TABLE orders ADD COLUMN customer_lng REAL")
    if "distance_km" not in order_columns:
        cur.execute("ALTER TABLE orders ADD COLUMN distance_km REAL DEFAULT 0")
    if "distance_surcharge" not in order_columns:
        cur.execute("ALTER TABLE orders ADD COLUMN distance_surcharge REAL DEFAULT 0")

    cur.execute("PRAGMA table_info(pharmacies)")
    pharmacy_columns = {row[1] for row in cur.fetchall()}
    if "phone" not in pharmacy_columns:
        cur.execute("ALTER TABLE pharmacies ADD COLUMN phone TEXT DEFAULT ''")
    if "hours" not in pharmacy_columns:
        cur.execute("ALTER TABLE pharmacies ADD COLUMN hours TEXT DEFAULT ''")
    if "areas_served" not in pharmacy_columns:
        cur.execute("ALTER TABLE pharmacies ADD COLUMN areas_served TEXT DEFAULT ''")

    satna_pharmacy_ids = []
    for pharmacy in SATNA_PHARMACIES:
        cur.execute(
            """
            SELECT id
            FROM pharmacies
            WHERE LOWER(location) = LOWER(?)
            LIMIT 1
            """,
            (pharmacy["location"],),
        )
        existing = cur.fetchone()
        if existing:
            pharmacy_id = existing["id"]
            cur.execute(
                """
                UPDATE pharmacies
                SET name = ?, location = ?, lat = ?, lng = ?, is_approved = 1, rating = ?, phone = ?, hours = ?, areas_served = ?
                WHERE id = ?
                """,
                (
                    pharmacy["name"],
                    pharmacy["location"],
                    pharmacy["lat"],
                    pharmacy["lng"],
                    pharmacy["rating"],
                    pharmacy["phone"],
                    pharmacy["hours"],
                    pharmacy["areas_served"],
                    pharmacy_id,
                ),
            )
        else:
            cur.execute(
                """
                INSERT INTO pharmacies (name, location, lat, lng, is_approved, medicines_count, rating, phone, hours, areas_served)
                VALUES (?, ?, ?, ?, 1, ?, ?, ?, ?, ?)
                """,
                (
                    pharmacy["name"],
                    pharmacy["location"],
                    pharmacy["lat"],
                    pharmacy["lng"],
                    pharmacy["medicines_count"],
                    pharmacy["rating"],
                    pharmacy["phone"],
                    pharmacy["hours"],
                    pharmacy["areas_served"],
                ),
            )
            pharmacy_id = cur.lastrowid
        satna_pharmacy_ids.append(pharmacy_id)

    if satna_pharmacy_ids:
        placeholders = ",".join("?" for _ in satna_pharmacy_ids)
        cur.execute(
            f"UPDATE pharmacies SET is_approved = CASE WHEN id IN ({placeholders}) THEN 1 ELSE 0 END",
            tuple(satna_pharmacy_ids),
        )

    cur.execute("SELECT COUNT(*) AS c FROM medicines")
    has_medicines = cur.fetchone()["c"] > 0
    if not has_medicines:
        base_pharmacy_ids = satna_pharmacy_ids[:3] if len(satna_pharmacy_ids) >= 3 else [1, 2, 3]
        cur.executemany(
            """
            INSERT INTO medicines (pharmacy_id, category, name, strength, unit, price, available, stock_qty)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            [
                (base_pharmacy_ids[0], "Everyday", "Paracetamol", "500mg", "strip", 20.0, 1, 200),
                (base_pharmacy_ids[0], "Everyday", "Ibuprofen", "200mg", "strip", 35.0, 1, 150),
                (base_pharmacy_ids[1], "Everyday", "Azithromycin", "250mg", "strip", 95.0, 1, 60),
                (base_pharmacy_ids[1], "Everyday", "Cetirizine", "10mg", "strip", 28.0, 1, 140),
                (base_pharmacy_ids[2], "Everyday", "ORS", "WHO Formula", "pack", 18.0, 1, 90),
                (base_pharmacy_ids[2], "Vitamins", "Vitamin C", "500mg", "bottle", 120.0, 1, 75),
            ],
        )

    # Ensure commonly searched medicines are present (idempotent insert).
    common_target_ids = satna_pharmacy_ids[:3] if len(satna_pharmacy_ids) >= 3 else [1, 2, 3]
    common_medicines = [
        (common_target_ids[0], "Dolo", "650mg", "strip", 30.0, 1, 120),
        (common_target_ids[0], "Crocin", "650mg", "strip", 34.0, 1, 90),
        (common_target_ids[1], "Calpol", "500mg", "strip", 26.0, 1, 110),
        (common_target_ids[1], "Pantoprazole", "40mg", "strip", 85.0, 1, 80),
        (common_target_ids[2], "Amoxicillin", "500mg", "strip", 98.0, 1, 70),
        (common_target_ids[2], "Zincovit", "multivitamin", "bottle", 145.0, 1, 55),
    ]
    for pharmacy_id, name, strength, unit, price, available, stock_qty in common_medicines:
        cur.execute(
            """
            SELECT id FROM medicines
            WHERE LOWER(name) = LOWER(?) AND LOWER(strength) = LOWER(?) AND LOWER(COALESCE(category, '')) = ''
            """,
            (name, strength),
        )
        exists = cur.fetchone()
        if not exists:
            cur.execute(
                """
                INSERT INTO medicines (pharmacy_id, name, strength, unit, price, available, stock_qty)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (pharmacy_id, name, strength, unit, price, available, stock_qty),
            )

    # Seed category pages with curated product catalog (idempotent).
    category_base_price = {
        "Everyday": 45.0,
        "Vitamins": 180.0,
        "First Aid": 85.0,
        "Personal Care": 140.0,
        "Baby Care": 210.0,
        "Women Health": 195.0,
    }
    category_default_unit = {
        "Everyday": "strip",
        "Vitamins": "bottle",
        "First Aid": "unit",
        "Personal Care": "unit",
        "Baby Care": "unit",
        "Women Health": "pack",
    }
    for category_name, products in CATEGORY_PRODUCTS.items():
        for idx, product_name in enumerate(products):
            if satna_pharmacy_ids:
                pharmacy_id = satna_pharmacy_ids[idx % len(satna_pharmacy_ids)]
            else:
                pharmacy_id = (idx % 3) + 1
            base_price = category_base_price[category_name]
            price = round(base_price + ((idx % 10) * 6.5), 2)
            stock_qty = 40 + (idx % 8) * 10
            cur.execute(
                """
                SELECT id FROM medicines
                WHERE LOWER(name) = LOWER(?)
                  AND LOWER(COALESCE(category, '')) = LOWER(?)
                """,
                (product_name, category_name),
            )
            exists = cur.fetchone()
            if not exists:
                cur.execute(
                    """
                    INSERT INTO medicines (pharmacy_id, category, name, strength, unit, price, available, stock_qty)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        pharmacy_id,
                        category_name,
                        product_name,
                        "",
                        category_default_unit[category_name],
                        price,
                        1,
                        stock_qty,
                    ),
                )

    curated_price_base = {
        "Infectious Diseases": 95.0,
        "Lifestyle Diseases": 140.0,
        "Respiratory Diseases": 120.0,
        "Mental Health": 180.0,
        "Nutritional Deficiency": 110.0,
        "Skin Diseases": 130.0,
        "Women & Child Health": 125.0,
        "Eye, Ear, ENT": 115.0,
    }

    def infer_unit(medicine_name):
        lower_name = (medicine_name or "").lower()
        if "syrup" in lower_name:
            return "bottle"
        if "drops" in lower_name or "spray" in lower_name:
            return "unit"
        if "cream" in lower_name or "ointment" in lower_name or "lotion" in lower_name:
            return "tube"
        if "inhaler" in lower_name:
            return "unit"
        if "capsules" in lower_name:
            return "bottle"
        return "strip"

    curated_idx = 0
    for disease_category, medicines_list in CURATED_DISEASE_MEDICINES.items():
        base_price = curated_price_base.get(disease_category, 120.0)
        for medicine_name, use_for in medicines_list:
            if satna_pharmacy_ids:
                pharmacy_id = satna_pharmacy_ids[curated_idx % len(satna_pharmacy_ids)]
            else:
                pharmacy_id = ((curated_idx % 3) + 1)
            unit = infer_unit(medicine_name)
            price = round(base_price + ((curated_idx % 7) * 8.0), 2)
            stock_qty = 35 + ((curated_idx % 6) * 10)
            curated_idx += 1

            cur.execute(
                """
                SELECT id FROM medicines
                WHERE LOWER(name) = LOWER(?)
                  AND LOWER(COALESCE(category, '')) = LOWER(?)
                """,
                (medicine_name, disease_category),
            )
            existing = cur.fetchone()
            if existing:
                cur.execute(
                    """
                    UPDATE medicines
                    SET use_for = ?, unit = COALESCE(NULLIF(unit, ''), ?)
                    WHERE id = ?
                    """,
                    (use_for, unit, existing["id"]),
                )
            else:
                cur.execute(
                    """
                    INSERT INTO medicines (pharmacy_id, category, name, use_for, strength, unit, price, available, stock_qty)
                    VALUES (?, ?, ?, ?, '', ?, ?, 1, ?)
                    """,
                    (pharmacy_id, disease_category, medicine_name, use_for, unit, price, stock_qty),
                )

            # Backfill purpose text for same medicine names created by earlier seeds.
            cur.execute(
                """
                UPDATE medicines
                SET use_for = COALESCE(NULLIF(TRIM(use_for), ''), ?)
                WHERE LOWER(name) = LOWER(?)
                """,
                (use_for, medicine_name),
            )

    curated_categories = tuple(CURATED_DISEASE_MEDICINES.keys())
    curated_placeholders = ",".join("?" for _ in curated_categories)
    cur.execute(
        f"""
        DELETE FROM medicines
        WHERE id NOT IN (
            SELECT MIN(id)
            FROM medicines
            WHERE category IN ({curated_placeholders})
            GROUP BY LOWER(name), LOWER(COALESCE(category, ''))
        )
        AND category IN ({curated_placeholders})
        """,
        curated_categories + curated_categories,
    )

    # Keep all medicines mapped only to Satna stores and distribute them across stores.
    if satna_pharmacy_ids:
        cur.execute("SELECT id FROM medicines ORDER BY id")
        medicine_rows = cur.fetchall()
        for idx, medicine in enumerate(medicine_rows):
            target_pharmacy_id = satna_pharmacy_ids[idx % len(satna_pharmacy_ids)]
            cur.execute(
                "UPDATE medicines SET pharmacy_id = ? WHERE id = ?",
                (target_pharmacy_id, medicine["id"]),
            )

    # Backfill pricing/offer/media fields for old rows.
    cur.execute(
        """
        UPDATE medicines
        SET mrp = ROUND(price * 1.2, 2)
        WHERE mrp IS NULL OR mrp <= 0
        """
    )
    cur.execute(
        """
        UPDATE medicines
        SET offer_text = (
            CAST(ROUND(((mrp - price) * 100.0) / NULLIF(mrp, 0)) AS INT) || '% OFF'
        )
        WHERE (offer_text IS NULL OR TRIM(offer_text) = '')
          AND mrp > price
        """
    )
    cur.execute(
        """
        UPDATE medicines
        SET offer_text = 'Best Price'
        WHERE offer_text IS NULL OR TRIM(offer_text) = ''
        """
    )
    # Use deterministic medicine-specific image source (PubChem) instead of random stock images.
    cur.execute(
        """
        UPDATE medicines
        SET image_url = CASE LOWER(name)
            WHEN 'dolo' THEN 'https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/paracetamol/PNG?image_size=large'
            WHEN 'crocin' THEN 'https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/paracetamol/PNG?image_size=large'
            WHEN 'calpol' THEN 'https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/paracetamol/PNG?image_size=large'
            WHEN 'vitamin c' THEN 'https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/ascorbic%20acid/PNG?image_size=large'
            WHEN 'vitamin d3' THEN 'https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/cholecalciferol/PNG?image_size=large'
            WHEN 'zincovit' THEN 'https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/zinc%20sulfate/PNG?image_size=large'
            WHEN 'ors' THEN 'https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/oral%20rehydration%20salts/PNG?image_size=large'
            ELSE 'https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/' || REPLACE(LOWER(name), ' ', '%20') || '/PNG?image_size=large'
        END
        WHERE image_url IS NULL
           OR TRIM(image_url) = ''
           OR image_url = '/medicine-placeholder.svg'
           OR image_url LIKE 'https://source.unsplash.com/%'
           OR image_url LIKE 'https://loremflickr.com/%'
           OR image_url LIKE 'https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/%'
        """
    )

    cur.execute(
        "UPDATE pharmacies SET medicines_count = (SELECT COUNT(*) FROM medicines m WHERE m.pharmacy_id = pharmacies.id)"
    )

    conn.commit()
    conn.close()
