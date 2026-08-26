"""Seed the database with tourist places for Visakhapatnam, Hyderabad, Goa, and Jaipur."""
import sys
sys.path.insert(0, ".")
from app.database import SessionLocal
from app.models import Place, Category
from sqlalchemy import text

db = SessionLocal()

# Get category ID mapping
cat_map = {c.name: c.id for c in db.query(Category).all()}
print("Category map:", cat_map)

places_data = [
    # Visakhapatnam (12 places)
    ("RK Beach (Ramakrishna Beach)", "Beach", 17.7231, 83.3372, 4.5, 90, "05:00:00", "21:00:00", 0, "Most popular beach in Vizag with scenic views, beach road, and submarine museum.", "Visakhapatnam", "Beach Road, Visakhapatnam"),
    ("Kailasagiri Hill Park", "Viewpoint", 17.7567, 83.3735, 4.4, 120, "05:30:00", "20:00:00", 40, "Hilltop park with giant Shiva-Parvati statue, cable car, and panoramic views.", "Visakhapatnam", "Kailasagiri, Visakhapatnam"),
    ("Araku Valley", "Park", 18.3272, 82.8753, 4.6, 240, "06:00:00", "18:00:00", 0, "Scenic hill station with coffee plantations, tribal culture, and fresh air.", "Visakhapatnam", "Araku Valley"),
    ("Borra Caves", "Viewpoint", 18.1157, 83.0404, 4.3, 90, "10:00:00", "17:00:00", 65, "Natural limestone caves 1 million years old with stalactites and stalagmites.", "Visakhapatnam", "Borra, Visakhapatnam"),
    ("Rushikonda Beach", "Beach", 17.7802, 83.3832, 4.3, 90, "06:00:00", "18:00:00", 0, "Blue-flag beach perfect for water sports like surfing and kayaking.", "Visakhapatnam", "Rushikonda, Visakhapatnam"),
    ("INS Kurusura Submarine Museum", "Museum", 17.7219, 83.3380, 4.4, 60, "10:00:00", "18:00:00", 40, "Decommissioned submarine converted into museum on the beach.", "Visakhapatnam", "RK Beach, Visakhapatnam"),
    ("VUDA Park", "Park", 17.7255, 83.3391, 4.1, 60, "11:00:00", "21:00:00", 30, "Amusement and nature park near the beach with rides and fountains.", "Visakhapatnam", "Beach Road, Visakhapatnam"),
    ("Yarada Beach", "Beach", 17.6460, 83.2943, 4.5, 90, "05:00:00", "20:00:00", 0, "Secluded pristine beach surrounded by hills, one of the cleanest in India.", "Visakhapatnam", "Yarada, Visakhapatnam"),
    ("Simhachalam Temple", "Temple", 17.7680, 83.2499, 4.6, 90, "06:00:00", "21:00:00", 0, "Ancient temple of Lord Varaha Narasimha set on a lush hill.", "Visakhapatnam", "Simhachalam, Visakhapatnam"),
    ("Bojjannakonda", "Museum", 17.5166, 82.8671, 4.2, 60, "09:00:00", "17:00:00", 15, "Buddhist rock-cut caves with ancient sculptures and meditation halls.", "Visakhapatnam", "Sankaram, Visakhapatnam"),
    ("Dolphin Nose Lighthouse", "Viewpoint", 17.6887, 83.2881, 4.3, 60, "10:00:00", "16:00:00", 20, "Scenic viewpoint at the edge of a cliff with stunning Bay of Bengal views.", "Visakhapatnam", "Dolphin Nose, Visakhapatnam"),
    ("Tenneti Park", "Park", 17.7308, 83.3488, 4.1, 45, "05:00:00", "22:00:00", 10, "Cliff-side garden park with sea views and steps to a small beach.", "Visakhapatnam", "Tenneti, Visakhapatnam"),
    # Hyderabad (10 places)
    ("Charminar", "Museum", 17.3616, 78.4747, 4.6, 90, "09:30:00", "17:30:00", 25, "Iconic 16th-century monument with four minarets in the heart of Old Hyderabad.", "Hyderabad", "Charminar, Hyderabad"),
    ("Golconda Fort", "Museum", 17.3833, 78.4011, 4.7, 150, "09:00:00", "17:30:00", 15, "Grand 400-year-old fort with acoustic clapping chamber and stunning views.", "Hyderabad", "Golconda, Hyderabad"),
    ("Hussain Sagar Lake", "Park", 17.4239, 78.4738, 4.3, 75, "05:00:00", "22:00:00", 0, "Large artificial lake with Buddha statue and boat rides.", "Hyderabad", "Tank Bund, Hyderabad"),
    ("Ramoji Film City", "Park", 17.2543, 78.6808, 4.5, 480, "09:00:00", "21:30:00", 1150, "Worlds largest film studio complex with theme park and tours.", "Hyderabad", "Anaspur Village, Hyderabad"),
    ("Salar Jung Museum", "Museum", 17.3711, 78.4798, 4.5, 120, "10:00:00", "17:00:00", 20, "One of Indias largest museums with rare artifacts collected across centuries.", "Hyderabad", "Salar Jung Road, Hyderabad"),
    ("Birla Mandir", "Temple", 17.4062, 78.4691, 4.5, 60, "07:00:00", "12:00:00", 0, "Stunning white marble temple atop a rocky hill overlooking the city.", "Hyderabad", "Naubat Pahad, Hyderabad"),
    ("Laad Bazaar", "Park", 17.3609, 78.4737, 4.2, 60, "10:00:00", "20:00:00", 0, "Famous bangle market near Charminar, bursting with color and tradition.", "Hyderabad", "Laad Bazaar, Hyderabad"),
    ("Qutb Shahi Tombs", "Museum", 17.3942, 78.3978, 4.4, 90, "09:30:00", "17:30:00", 15, "Royal tombs of the Qutb Shahi dynasty amid serene gardens.", "Hyderabad", "Ibrahim Bagh, Hyderabad"),
    ("Chowmahalla Palace", "Museum", 17.3587, 78.4682, 4.6, 90, "10:00:00", "17:00:00", 80, "Magnificent palace of the Nizams with vintage cars and royal artifacts.", "Hyderabad", "Khilwat, Hyderabad"),
    ("Mecca Masjid", "Temple", 17.3604, 78.4738, 4.4, 45, "04:30:00", "21:00:00", 0, "One of the oldest and largest mosques in India, built during Mughal era.", "Hyderabad", "Charminar, Hyderabad"),
    # Goa (10 places)
    ("Baga Beach", "Beach", 15.5553, 73.7517, 4.3, 120, "06:00:00", "22:00:00", 0, "Lively beach famous for water sports, beach shacks, and nightlife.", "Goa", "Baga, North Goa"),
    ("Basilica of Bom Jesus", "Temple", 15.5009, 73.9116, 4.7, 75, "09:00:00", "18:30:00", 0, "UNESCO World Heritage Site with relics of St. Francis Xavier.", "Goa", "Old Goa"),
    ("Dudhsagar Waterfalls", "Viewpoint", 15.3148, 74.3145, 4.8, 180, "08:00:00", "18:00:00", 400, "Four-tiered 600m-tall waterfall on the Goa-Karnataka border.", "Goa", "Mollem National Park, Goa"),
    ("Fort Aguada", "Museum", 15.4913, 73.7736, 4.5, 90, "09:30:00", "18:00:00", 15, "17th-century Portuguese fort overlooking the Arabian Sea.", "Goa", "Candolim, North Goa"),
    ("Calangute Beach", "Beach", 15.5439, 73.7554, 4.2, 90, "06:00:00", "22:00:00", 0, "Queen of beaches in Goa, busy and vibrant with market stalls.", "Goa", "Calangute, North Goa"),
    ("Palolem Beach", "Beach", 14.9999, 74.0232, 4.6, 120, "06:00:00", "22:00:00", 0, "Crescent-shaped paradise beach in South Goa, calm and beautiful.", "Goa", "Palolem, South Goa"),
    ("Se Cathedral", "Temple", 15.5007, 73.9120, 4.5, 60, "09:00:00", "17:00:00", 0, "Asias largest church, dedicated to St. Catherine, built in 1619.", "Goa", "Old Goa"),
    ("Anjuna Flea Market", "Park", 15.5766, 73.7404, 4.1, 90, "08:00:00", "18:00:00", 0, "Famous Wednesday flea market with hippie vibes, crafts, and food.", "Goa", "Anjuna, North Goa"),
    ("Chapora Fort", "Museum", 15.6032, 73.7352, 4.4, 75, "09:30:00", "17:30:00", 0, "Iconic fort from Dil Chahta Hai with stunning river views.", "Goa", "Chapora, North Goa"),
    ("Colva Beach", "Beach", 15.2792, 73.9226, 4.2, 90, "06:00:00", "21:00:00", 0, "Quiet long stretch of white sand in South Goa with coconut palms.", "Goa", "Colva, South Goa"),
    # Jaipur (10 places)
    ("Hawa Mahal", "Museum", 26.9239, 75.8267, 4.7, 90, "09:00:00", "17:00:00", 50, "Iconic Palace of Winds with 953 tiny windows for royal ladies.", "Jaipur", "Siredeori Bazaar, Jaipur"),
    ("Amber Fort", "Museum", 26.9855, 75.8513, 4.8, 180, "08:00:00", "20:00:00", 100, "Magnificent hilltop fort with palatial courts, elephant rides, and light show.", "Jaipur", "Devisinghpura, Amber, Jaipur"),
    ("City Palace", "Museum", 26.9258, 75.8237, 4.6, 120, "09:30:00", "17:00:00", 200, "Royal palace complex housing a museum with royal artifacts and costumes.", "Jaipur", "Tulsi Marg, Jaipur"),
    ("Jantar Mantar", "Museum", 26.9247, 75.8242, 4.5, 60, "09:00:00", "17:00:00", 50, "UNESCO-listed astronomical observatory with giant stone instruments.", "Jaipur", "Gangori Bazar, Jaipur"),
    ("Jal Mahal", "Park", 26.9516, 75.8492, 4.3, 45, "06:00:00", "18:00:00", 0, "Stunning mid-lake palace visible from the road.", "Jaipur", "Man Sagar Lake, Jaipur"),
    ("Nahargarh Fort", "Museum", 26.9438, 75.8043, 4.5, 120, "10:00:00", "18:00:00", 50, "Hilltop fort with the best sunset view of Jaipur city.", "Jaipur", "Aravalli Range, Jaipur"),
    ("Jaigarh Fort", "Museum", 27.0005, 75.8435, 4.4, 90, "09:00:00", "17:30:00", 35, "Fort housing the worlds largest cannon on wheels, Jaivana.", "Jaipur", "Devisinghpura, Jaipur"),
    ("Johri Bazaar", "Park", 26.9226, 75.8234, 4.3, 90, "10:00:00", "21:00:00", 0, "Famous jewelry market for Kundan, Meena, and Polki jewelry.", "Jaipur", "Johri Bazaar, Jaipur"),
    ("Albert Hall Museum", "Museum", 26.9001, 75.8188, 4.4, 90, "09:00:00", "17:00:00", 40, "Oldest museum in Rajasthan in a beautiful Indo-Saracenic building.", "Jaipur", "Ram Niwas Garden, Jaipur"),
    ("Birla Mandir Jaipur", "Temple", 26.8931, 75.8093, 4.5, 60, "06:00:00", "12:00:00", 0, "White marble temple dedicated to Laxmi-Narayan with intricate carvings.", "Jaipur", "Statue Circle, Jaipur"),
]

# Clear existing places
db.execute(text("DELETE FROM places"))
db.commit()

count = 0
for name, cat_name, lat, lon, rating, dur, open_t, close_t, fee, desc, city, addr in places_data:
    cat_id = cat_map.get(cat_name)
    p = Place(
        name=name, category_id=cat_id, latitude=lat, longitude=lon,
        rating=rating, avg_visit_duration=dur,
        opening_time=open_t, closing_time=close_t,
        entry_fee=fee, description=desc, city=city, address=addr,
        is_active=True,
    )
    db.add(p)
    count += 1

db.commit()
print(f"Seeded {count} places into MySQL")

# Verify
result = db.execute(text("SELECT COUNT(*) FROM places"))
print(f"Total places now: {result.scalar()}")
result = db.execute(text("SELECT city, COUNT(*) FROM places GROUP BY city"))
for row in result:
    print(f"  {row[0]}: {row[1]} places")
db.close()
