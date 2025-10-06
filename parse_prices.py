import csv
import sys

# Read the price list from the CSV file
service_prices = []
category_mapping = {
    'Consultations & Packages': 'consultation',
    'Laboratory Services': 'lab-test',
    'Pharmaceutical & Medical Supplies': 'medication',
    'Imaging & Radiology': 'procedure',
    'Dental Services': 'procedure',
    'Ophthalmology': 'procedure',
    'Other': 'procedure'
}

# Read from the CSV file
with open('prices.csv', 'r') as f:
    reader = csv.reader(f)
    next(reader)  # Skip header
    for row in reader:
        if len(row) >= 4:
            code = row[0].strip()
            service = row[1].strip()
            price = row[2].strip()
            category = row[3].strip()
            
            # Skip header rows
            if code == 'Code' or service == 'Service':
                continue
                
            # Convert price to number
            try:
                price_num = float(price)
            except ValueError:
                continue
                
            # Map category to existing ones
            mapped_category = category_mapping.get(category, 'procedure')
            
            # Create service price object
            service_price = {
                'code': code,
                'service': service,
                'price': price_num,
                'category': mapped_category
            }
            service_prices.append(service_price)

# Generate TypeScript code
print(f"    // Tanzania Service Prices in TZS - Updated with {len(service_prices)} services")
print("    const mockServicePrices: ServicePrice[] = [")

for i, sp in enumerate(service_prices):
    # Generate ID (using index + 1 to match existing pattern)
    id_val = str(i + 1)
    
    # Escape any quotes in the service name
    service_name = sp['service'].replace('"', '\\"')
    
    print(f"      {{ id: '{id_val}', category: '{sp['category']}', serviceName: '{service_name}', price: {int(sp['price'])}, description: '' }},")

print("    ];")