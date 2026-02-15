import json
from confluent_kafka import Producer


PRACTITIONERS = [
    {"id": 1, "name": "Dr. Smith", "email": "smith@example.com"},
    {"id": 2, "name": "Dr. Jones", "email": "jones@example.com"},
    {"id": 3, "name": "Dr. Patel", "email": "patel@example.com"},
    {"id": 4, "name": "Dr. Lee", "email": "lee@example.com"},
    {"id": 5, "name": "Dr. Garcia", "email": "garcia@example.com"},
    {"id": 6, "name": "Dr. Chen", "email": "chen@example.com"},
    {"id": 7, "name": "Dr. Wilson", "email": "wilson@example.com"},
]

SPECIALITIES = [
    {"practitioner_id": 1, "speciality": "Cardiology"},
    {"practitioner_id": 1, "speciality": "Internal Medicine"},
    {"practitioner_id": 2, "speciality": "Dermatology"},
    {"practitioner_id": 2, "speciality": "Pediatrics"},
    {"practitioner_id": 3, "speciality": "Neurology"},
    {"practitioner_id": 3, "speciality": "Psychiatry"},
    {"practitioner_id": 3, "speciality": "Internal Medicine"},
    {"practitioner_id": 4, "speciality": "Orthopedics"},
    {"practitioner_id": 4, "speciality": "Sports Medicine"},
    {"practitioner_id": 5, "speciality": "Oncology"},
    {"practitioner_id": 5, "speciality": "Hematology"},
    {"practitioner_id": 5, "speciality": "Internal Medicine"},
    {"practitioner_id": 6, "speciality": "Ophthalmology"},
    {"practitioner_id": 6, "speciality": "Surgery"},
    {"practitioner_id": 7, "speciality": "Radiology"},
    {"practitioner_id": 7, "speciality": "Nuclear Medicine"},
]


def delivery_report(err, msg):
    if err:
        print(f"  Delivery failed: {err}")


def produce():
    producer = Producer({"bootstrap.servers": "localhost:9092"})

    print("Producing practitioners...")
    for p in PRACTITIONERS:
        producer.produce(
            "practitioners",
            key=str(p["id"]),
            value=json.dumps(p),
            callback=delivery_report,
        )
    producer.flush()
    print(f"  Produced {len(PRACTITIONERS)} practitioners")

    print("Producing specialities...")
    for s in SPECIALITIES:
        producer.produce(
            "specialities",
            key=str(s["practitioner_id"]),
            value=json.dumps(s),
            callback=delivery_report,
        )
    producer.flush()
    print(f"  Produced {len(SPECIALITIES)} specialities")


if __name__ == "__main__":
    produce()
