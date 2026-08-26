"""Seed 6 additional popular Indian cities into the database."""
import sys
sys.path.insert(0, ".")
from app.database import SessionLocal
from app.models import Place, Category
from sqlalchemy import text

db = SessionLocal()
cat_map = {c.name: c.id for c in db.query(Category).all()}
print("Category map:", cat_map)

places_data = [
    # Mumbai (10 places)
    ("Gateway of India", "Museum", 18.9220, 72.8347, 4.7, 60, "07:00:00", "23:00:00", 0, "Iconic arch-monument built in 1924 overlooking the Arabian Sea.", "Mumbai", "Apollo Bunder, Mumbai"),
    ("Marine Drive", "Viewpoint", 18.9432, 72.8234, 4.5, 60, "05:00:00", "23:00:00", 0, "3.6 km arc-shaped boulevard along the coast, Queen's Necklace at night.", "Mumbai", "Marine Drive, Mumbai"),
    ("Elephanta Caves", "Museum", 18.9634, 72.9315, 4.5, 180, "09:00:00", "17:30:00", 500, "UNESCO World Heritage Site with ancient rock-cut caves and Shiva sculptures.", "Mumbai", "Elephanta Island, Mumbai"),
    ("Chhatrapati Shivaji Terminus", "Museum", 18.9398, 72.8355, 4.6, 45, "08:00:00", "22:00:00", 0, "Victorian Gothic railway station, UNESCO World Heritage Site.", "Mumbai", "CS Terminus, Mumbai"),
    ("Siddhivinayak Temple", "Temple", 19.0169, 72.8310, 4.7, 60, "05:30:00", "21:00:00", 0, "Famous Ganesh temple visited by millions of devotees each year.", "Mumbai", "Prabhadevi, Mumbai"),
    ("Juhu Beach", "Beach", 19.0948, 72.8267, 4.2, 90, "05:00:00", "23:00:00", 0, "Popular beach known for street food, evening walks, and Bollywood mansions.", "Mumbai", "Juhu, Mumbai"),
    ("Haji Ali Dargah", "Temple", 18.9827, 72.8089, 4.5, 45, "05:30:00", "22:30:00", 0, "Stunning mosque and tomb on an islet in the Arabian Sea.", "Mumbai", "Worli, Mumbai"),
    ("Chowpatty Beach", "Beach", 18.9543, 72.8131, 4.0, 60, "05:00:00", "23:00:00", 0, "Famous beach for street food and Ganesh Chaturthi celebrations.", "Mumbai", "Girgaon, Mumbai"),
    ("Sanjay Gandhi National Park", "Park", 19.2147, 72.9107, 4.4, 180, "07:30:00", "18:0:00", 50, "Massive national park within the city with Kanheri Caves and lion safari.", "Mumbai", "Borivali East, Mumbai"),
    ("Colaba Causeway", "Park", 18.9154, 72.8264, 4.1, 90, "09:00:00", "22:00:00", 0, "Bustling street market for clothes, jewellery, and antiques.", "Mumbai", "Colaba, Mumbai"),
    # Delhi (10 places)
    ("India Gate", "Museum", 28.6129, 77.2295, 4.6, 60, "00:00:00", "23:59:00", 0, "42-metre war memorial arch honouring 70,000 Indian soldiers.", "Delhi", "Rajpath, New Delhi"),
    ("Red Fort", "Museum", 28.6562, 77.2410, 4.6, 120, "09:30:00", "16:30:00", 35, "UNESCO-listed Mughal fortress palace built in 1648 by Shah Jahan.", "Delhi", "Chandni Chowk, Old Delhi"),
    ("Qutub Minar", "Museum", 28.5244, 77.1855, 4.7, 90, "07:00:00", "17:00:00", 35, "73-metre tapering tower, UNESCO World Heritage Site from 1193 AD.", "Delhi", "Mehrauli, New Delhi"),
    ("Humayun's Tomb", "Museum", 28.5933, 77.2507, 4.7, 90, "06:00:00", "18:00:00", 35, "Precursor to the Taj Mahal, UNESCO World Heritage Mughal garden tomb.", "Delhi", "Nizamuddin, New Delhi"),
    ("Lotus Temple", "Temple", 28.5535, 77.2588, 4.6, 60, "09:00:00", "17:30:00", 0, "Stunning lotus-shaped Bahá'í House of Worship open to all faiths.", "Delhi", "Kalkaji, New Delhi"),
    ("Chandni Chowk", "Park", 28.6506, 77.2303, 4.3, 90, "09:00:00", "21:00:00", 0, "One of oldest and busiest markets in Old Delhi, street food paradise.", "Delhi", "Chandni Chowk, Old Delhi"),
    ("Akshardham Temple", "Temple", 28.6127, 77.2773, 4.7, 150, "10:00:00", "18:00:00", 0, "Spectacular Hindu temple complex with exhibitions, gardens, and boat ride.", "Delhi", "Pocket E, New Delhi"),
    ("Jantar Mantar", "Museum", 28.6271, 77.2166, 4.5, 60, "06:00:00", "17:00:00", 50, "18th-century astronomical observation site with giant instruments.", "Delhi", "Connaught Place, New Delhi"),
    ("Hauz Khas Village", "Park", 28.5494, 77.2001, 4.3, 90, "10:00:00", "23:00:00", 0, "Trendy village with medieval ruins, lake, and vibrant nightlife.", "Delhi", "Hauz Khas, New Delhi"),
    ("Lotus Garden Park", "Park", 28.5733, 77.2540, 4.2, 60, "06:00:00", "21:00:00", 0, "Beautiful garden park near the Lotus Temple with walking trails.", "Delhi", "Nehru Place, New Delhi"),
    # Bangalore (10 places)
    ("Cubbon Park", "Park", 12.9763, 77.5929, 4.5, 90, "06:00:00", "18:00:00", 0, "300-acre colonial-era park in the heart of Bangalore with heritage buildings.", "Bangalore", "Kasturba Road, Bangalore"),
    ("Bangalore Palace", "Museum", 12.9987, 77.5921, 4.4, 90, "10:00:00", "17:30:00", 230, "Tudor-style palace built in 1887 with Gothic wooden carvings.", "Bangalore", "Vasanth Nagar, Bangalore"),
    ("ISKCON Temple Bangalore", "Temple", 13.0102, 77.5511, 4.6, 60, "07:15:00", "13:00:00", 0, "One of the largest ISKCON temples in the world with stunning architecture.", "Bangalore", "Rajajinagar, Bangalore"),
    ("Lalbagh Botanical Garden", "Park", 12.9507, 77.5848, 4.6, 120, "06:00:00", "18:00:00", 20, "240-acre garden with rare tropical plants, glass house, and lake.", "Bangalore", "Lalbagh, Bangalore"),
    ("Nandi Hills", "Viewpoint", 13.3702, 77.6835, 4.5, 120, "06:00:00", "18:00:00", 0, "Scenic hilltop fort at 1,478m with sunrise views and ancient Nandi temple.", "Bangalore", "Nandi Hills, Chikkaballapur"),
    ("Vidhana Soudha", "Museum", 12.9795, 77.5907, 4.4, 45, "09:00:00", "17:00:00", 0, "Imposing Neo-Dravidian legislature building, illuminated on Sundays.", "Bangalore", "Dr. Ambedkar Road, Bangalore"),
    ("UB City Mall", "Park", 12.9718, 77.5970, 4.3, 90, "10:00:00", "22:00:00", 0, "Premium luxury mall with rooftop restaurants and art galleries.", "Bangalore", "Vittal Mallya Road, Bangalore"),
    ("Bannerghatta National Park", "Park", 12.8005, 77.5770, 4.4, 180, "09:30:00", "17:00:00", 80, "Wildlife sanctuary with safari, zoo, butterfly park, and rescue centre.", "Bangalore", "Bannerghatta Road, Bangalore"),
    ("Commercial Street", "Park", 12.9815, 77.6060, 4.1, 60, "10:00:00", "21:00:00", 0, "Bustling shopping street for clothes, shoes, jewellery, and accessories.", "Bangalore", "Shivajinagar, Bangalore"),
    ("Ulsoor Lake", "Park", 12.9784, 77.6240, 4.2, 60, "06:00:00", "18:00:00", 10, "Scenic lake with boating, walking path, and park in central Bangalore.", "Bangalore", "Ulsoor, Bangalore"),
    # Kolkata (8 places)
    ("Victoria Memorial", "Museum", 22.5449, 88.3426, 4.7, 120, "10:00:00", "18:00:00", 30, "Magnificent white marble memorial to Queen Victoria, now an art museum.", "Kolkata", "Maidan, Kolkata"),
    ("Howrah Bridge", "Viewpoint", 22.5851, 88.3468, 4.5, 30, "00:00:00", "23:59:00", 0, "Iconic cantilever bridge over the Hooghly River, engineering marvel.", "Kolkata", "Howrah, Kolkata"),
    ("Indian Museum", "Museum", 22.5574, 88.3510, 4.4, 120, "10:00:00", "17:00:00", 20, "Oldest and largest museum in India with 100,000+ artefacts.", "Kolkata", "Park Street, Kolkata"),
    ("Dakshineswar Kali Temple", "Temple", 22.6547, 88.3575, 4.6, 60, "06:00:00", "20:30:00", 0, "Sacred 19th-century temple where Ramakrishna Paramahamsa had visions.", "Kolkata", "Dakshineswar, Kolkata"),
    ("Marble Palace", "Museum", 22.5803, 88.3639, 4.3, 60, "10:00:00", "16:00:00", 0, "19th-century mansion with rare art, antiques, and Victorian furniture.", "Kolkata", "Muktaram Babu Street, Kolkata"),
    ("Princep Ghat", "Viewpoint", 22.5471, 88.3233, 4.4, 45, "08:00:00", "20:00:00", 0, "Beautiful riverside ghat with Palladian architecture and boat rides.", "Kolkata", "Fort William, Kolkata"),
    ("Science City", "Museum", 22.5400, 88.3939, 4.3, 120, "09:00:00", "20:00:00", 50, "Largest science centre in the Indian subcontinent with IMAX theatre.", "Kolkata", "JBS Haldane Avenue, Kolkata"),
    ("Kalighat Temple", "Temple", 22.5195, 88.3457, 4.4, 30, "05:00:00", "20:30:00", 0, "One of the 51 Shakti Peethas, ancient temple dedicated to Goddess Kali.", "Kolkata", "Kalighat, Kolkata"),
    # Udaipur (8 places)
    ("City Palace Udaipur", "Museum", 24.5764, 73.6913, 4.7, 120, "09:30:00", "17:30:00", 300, "Majestic palace complex overlooking Lake Pichola with museums and gardens.", "Udaipur", "City Palace Road, Udaipur"),
    ("Lake Pichola", "Park", 24.5713, 73.6814, 4.6, 90, "06:00:00", "20:00:00", 0, "Serene artificial lake with boat rides to Jag Mandir and Lake Palace.", "Udaipur", "Lake Pichola, Udaipur"),
    ("Jagdish Temple", "Temple", 24.5882, 73.6856, 4.5, 45, "05:15:00", "20:00:00", 0, "Ornate Indo-Aryan temple dedicated to Lord Vishnu, built in 1651.", "Udaipur", "Jagdish Chowk, Udaipur"),
    ("Saheliyon Ki Bari", "Park", 24.5927, 73.6884, 4.4, 45, "08:00:00", "19:00:00", 10, "Garden of the Maidens with lotus pools, marble elephants, and fountains.", "Udaipur", "Gangaur Ghat Road, Udaipur"),
    ("Monsoon Palace", "Viewpoint", 24.5374, 73.6586, 4.3, 90, "08:00:00", "18:00:00", 80, "Hilltop palace with panoramic views of lakes and Aravalli hills.", "Udaipur", "Sajjangarh, Udaipur"),
    ("Fateh Sagar Lake", "Park", 24.6004, 73.6794, 4.4, 60, "06:00:00", "20:00:00", 0, "Scenic lake with Nehru Island Park and boating facilities.", "Udaipur", "Fateh Sagar, Udaipur"),
    ("Bagore Ki Haveli", "Museum", 24.5767, 73.6835, 4.5, 60, "10:00:00", "20:00:00", 60, "18th-century haveli with cultural shows, Rajasthani dance, and museum.", "Udaipur", "Gangaur Ghat Road, Udaipur"),
    ("Jag Mandir Island", "Park", 24.5600, 73.6800, 4.5, 90, "10:00:00", "18:00:00", 0, "Island palace on Lake Pichola with gardens, marble elephant, and history.", "Udaipur", "Lake Pichola, Udaipur"),
    # Pondicherry (8 places)
    ("Promenade Beach", "Beach", 11.9337, 79.8358, 4.3, 90, "05:00:00", "21:00:00", 0, "1.5 km rocky beach stretch with Gandhi statue, heritage buildings, and sea.", "Pondicherry", "Goubert Avenue, Pondicherry"),
    ("Auroville", "Park", 12.0055, 79.8107, 4.5, 180, "09:00:00", "16:30:00", 0, "Experimental universal township with the golden Matrimandir meditation dome.", "Pondicherry", "Auroville, Pondicherry"),
    ("Sri Aurobindo Ashram", "Temple", 11.9338, 79.8361, 4.6, 60, "08:00:00", "12:00:00", 0, "Spiritual community founded by Sri Aurobindo with serene meditation halls.", "Pondicherry", "Rue de la Marine, Pondicherry"),
    ("French Quarter", "Park", 11.9342, 79.8347, 4.4, 90, "09:00:00", "21:00:00", 0, "Charming colonial streets with pastel houses, cafes, and boutiques.", "Pondicherry", "White Town, Pondicherry"),
    ("Paradise Beach", "Beach", 11.8955, 79.8343, 4.2, 120, "09:00:00", "17:00:00", 150, "Secluded golden sand beach accessible by boat, with water sports.", "Pondicherry", "Chunnambar, Pondicherry"),
    ("Botanical Garden", "Park", 11.9294, 79.8235, 4.1, 60, "10:00:00", "17:00:00", 10, "250-year-old garden with rare tropical plants and a musical fountain.", "Pondicherry", "Romain Rolland Street, Pondicherry"),
    ("Basilica of the Sacred Heart", "Temple", 11.9383, 79.8327, 4.4, 45, "07:00:00", "18:30:00", 0, "Neo-Gothic church with stunning stained glass windows and peaceful ambience.", "Pondicherry", "Mission Street, Pondicherry"),
    ("Aurobindo Beach", "Beach", 11.9246, 79.8395, 4.2, 60, "05:00:00", "19:00:00", 0, "Quiet beach near the Ashram, ideal for morning meditation and surf.", "Pondicherry", "Serenity Beach, Pondicherry"),
]

# Only insert places for cities not already in DB
existing_cities = {row[0] for row in db.execute(text("SELECT DISTINCT city FROM places")).fetchall()}
print(f"Existing cities: {existing_cities}")

new_count = 0
for name, cat_name, lat, lon, rating, dur, open_t, close_t, fee, desc, city, addr in places_data:
    if city in existing_cities:
        continue
    cat_id = cat_map.get(cat_name)
    p = Place(
        name=name, category_id=cat_id, latitude=lat, longitude=lon,
        rating=rating, avg_visit_duration=dur,
        opening_time=open_t, closing_time=close_t,
        entry_fee=fee, description=desc, city=city, address=addr,
        is_active=True,
    )
    db.add(p)
    new_count += 1

db.commit()
print(f"Added {new_count} new places")

# Verify
result = db.execute(text("SELECT city, COUNT(*) FROM places GROUP BY city ORDER BY COUNT(*) DESC"))
print("\nAll cities:")
for row in result:
    print(f"  {row[0]}: {row[1]} places")
db.close()
