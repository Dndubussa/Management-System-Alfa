import csv
import re

def clean_price(price_str):
    """Clean and convert price string to number"""
    if not price_str:
        return 0
    # Remove currency symbols, commas and other non-numeric characters except decimal point
    cleaned = re.sub(r'[^\d.]', '', price_str)
    try:
        return int(float(cleaned))
    except ValueError:
        return 0

def clean_service_name(name):
    """Clean service name for better readability"""
    if not name:
        return ""
    # Remove extra whitespace and clean up formatting
    cleaned = re.sub(r'\s+', ' ', name.strip())
    return cleaned

def parse_csv_to_typescript(csv_file_path):
    """Parse CSV file and generate TypeScript service prices array"""
    
    service_prices = []
    category_mapping = {
        'LABORATORY SERVICES': 'lab-test',
        'DENTAL SERVICES': 'procedure',
        'OPTHALMOLOGY': 'procedure',
        'PHARMACEUTICAL SUPPLIES': 'medication',
        'PROCEDURAL CHARGES': 'procedure',
        'SURGICAL CHARGES': 'procedure',
        'RADIOLOGY CHARGES': 'procedure',
        'PSYCHIATRY/ COUNSELLING SERVICES': 'consultation',
        'PHYSIOTHERAPY CHARGES': 'procedure'
    }
    
    current_category = 'procedure'  # default category
    service_id = 1
    
    with open(csv_file_path, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        for row in reader:
            # Skip empty rows
            if not row or not any(cell.strip() for cell in row):
                continue
                
            # Check if this row defines a new category
            if len(row) >= 1 and row[0].strip().upper() in category_mapping:
                current_category = category_mapping[row[0].strip().upper()]
                continue
            
            # Skip header rows
            if len(row) >= 2 and (row[0].strip().upper() == 'ITEM' or row[1].strip().upper() == 'PRICE'):
                continue
                
            # Process service rows (2 or 3 columns)
            if len(row) >= 2:
                # Extract service name and price
                service_name = ''
                price = 0
                
                # Handle different row formats
                if len(row) == 2:
                    # Format: [service_name, price]
                    service_name = row[0].strip()
                    price = clean_price(row[1])
                elif len(row) >= 3:
                    # Format: [service_name, price] or [category, service_name, price]
                    # Check if first column is a category
                    if row[0].strip().upper() in category_mapping:
                        current_category = category_mapping[row[0].strip().upper()]
                        service_name = row[1].strip()
                        price = clean_price(row[2])
                    else:
                        # First column is service name
                        service_name = row[0].strip()
                        price = clean_price(row[1])
                
                # Only add if we have a valid service name and price
                if service_name and price > 0:
                    # Special handling for consultation packages
                    if 'PACKAGE' in service_name.upper():
                        category = 'consultation'
                    else:
                        category = current_category
                        
                    service_prices.append({
                        'id': str(service_id),
                        'category': category,
                        'serviceName': clean_service_name(service_name),
                        'price': price,
                        'description': ''
                    })
                    service_id += 1
    
    return service_prices

def generate_typescript_code(service_prices):
    """Generate TypeScript code for service prices"""
    ts_code = [
        "    // Tanzania Service Prices in TZS - Updated with {} services".format(len(service_prices)),
        "    const mockServicePrices: ServicePrice[] = ["
    ]
    
    for sp in service_prices:
        # Escape quotes in service name
        service_name = sp['serviceName'].replace('"', '\\"')
        ts_code.append(
            "      {{ id: '{}', category: '{}', serviceName: '{}', price: {}, description: '' }},".format(
                sp['id'], sp['category'], service_name, sp['price']
            )
        )
    
    ts_code.append("    ];")
    return "\n".join(ts_code)

# Main execution
if __name__ == "__main__":
    csv_file_path = "ALFA HOSPITALS PRICE LIST.csv"
    service_prices = parse_csv_to_typescript(csv_file_path)
    ts_code = generate_typescript_code(service_prices)
    print(ts_code)
    
    # Also save to a file
    with open("service_prices_output.ts", "w", encoding="utf-8") as f:
        f.write(ts_code)
    
    print(f"\nProcessed {len(service_prices)} services.")
    print("Output saved to service_prices_output.ts")