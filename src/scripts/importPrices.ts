import fs from 'fs';
import path from 'path';
import { supabase } from '../config/supabase.js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Enhanced CSV parser for the provided format
function parseCsv(content: string): { category: string; service_name: string; price: number; description: string }[] {
	const lines = content.split(/\r?\n/);
	let category = '';
	const items: { category: string; service_name: string; price: number; description: string }[] = [];
	
	for (let i = 0; i < lines.length; i++) {
		const raw = lines[i]?.trim();
		if (!raw) continue;
		
		// Category lines can end with single comma (e.g., LABORATORY SERVICES,) or double comma (e.g., OPTHALMOLOGY,,)
		if ((raw.endsWith(',') || raw.endsWith(',,')) && !raw.includes('"') && !raw.includes('Item')) {
			// Check if this looks like a category header (all caps, contains letters)
			if (/^[A-Z][A-Z\s/]*[A-Z]/.test(raw)) {
				category = raw.replace(/,,?$/, '').trim();
				console.log(`Found category: ${category}`);
				continue;
			}
		}
		
		// Skip header rows like "Item,Price" or "Item,,Price"
		if (/^item\s*,+\s*price/i.test(raw)) continue;
		
		// Data rows: name,price or name,,price
		// Handle both formats: "SERVICE NAME","30,000" and SERVICE NAME,,"30,000"
		const match = raw.match(/^"?(.+?)"?\s*,+\s*"?([0-9,]+)"?$/);
		if (match) {
			const name = match[1].trim();
			const priceStr = match[2].replace(/,/g, '').trim();
			const priceNum = Number(priceStr);
			if (!Number.isNaN(priceNum) && name && category) {
				items.push({
					category: category,
					service_name: name,
					price: priceNum,
					description: ''
				});
			}
		}
	}
	return items;
}

async function upsertPrice(item: { category: string; service_name: string; price: number; description: string }) {
	// Try to find an existing row by category + service_name
	const { data: existing, error: findError } = await supabase
		.from('service_prices')
		.select('id, price')
		.eq('category', mapCategory(item.category))
		.eq('service_name', item.service_name)
		.limit(1)
		.maybeSingle();

	if (findError) {
		console.error('Find error:', findError.message, 'for', item.service_name);
		return false;
	}

	if (existing?.id) {
		const { error: updError } = await supabase
			.from('service_prices')
			.update({ price: item.price, description: item.description })
			.eq('id', existing.id);
		if (updError) {
			console.error('Update error:', updError.message, 'for', item.service_name);
			return false;
		}
		return true;
	}

	const { error: insError } = await supabase
		.from('service_prices')
		.insert({
			category: mapCategory(item.category),
			service_name: item.service_name,
			price: item.price,
			description: item.description,
		});
	if (insError) {
		console.error('Insert error:', insError.message, 'for', item.service_name);
		return false;
	}
	return true;
}

async function run() {
	try {
		const csvPath = path.resolve(process.cwd(), 'ALFA HOSPITALS PRICE LIST.csv');
		const content = fs.readFileSync(csvPath, 'utf8');
		const items = parseCsv(content);
		console.log(`Parsed ${items.length} items`);

		let success = 0;
		for (const item of items) {
			const ok = await upsertPrice(item);
			if (ok) success++;
		}
		console.log(`Imported ${success} price items into service_prices`);
		process.exit(0);
	} catch (e: any) {
		console.error('Import failed:', e.message);
		process.exit(1);
	}
}

function mapCategory(raw: string): 'consultation' | 'lab-test' | 'medication' | 'procedure' | 'radiology' | 'physiotherapy' | 'psychiatry' | 'ophthalmology' {
	const s = raw.toLowerCase();
	
	// Laboratory services
	if (s.includes('laboratory') || s.includes('lab')) return 'lab-test';
	
	// Medications and pharmacy
	if (s.includes('pharmacy') || s.includes('pharmaceutical') || s.includes('medication')) return 'medication';
	
	// Procedures and surgeries
	if (s.includes('procedure') || s.includes('surgical') || s.includes('surgery') || 
	    s.includes('extraction') || s.includes('dental') || s.includes('operation')) return 'procedure';
	
	// Radiology and imaging
	if (s.includes('radiology') || s.includes('scan') || s.includes('x-ray') || 
	    s.includes('ultrasound') || s.includes('ct') || s.includes('mri')) return 'radiology';
	
	// Physiotherapy and therapy
	if (s.includes('physiotherapy') || s.includes('therapy') || s.includes('rehabilitation')) return 'physiotherapy';
	
	// Psychiatry and counselling
	if (s.includes('psychiatry') || s.includes('counselling') || s.includes('mental health')) return 'psychiatry';
	
	// Ophthalmology and eye care
	if (s.includes('ophthalmology') || s.includes('eye') || s.includes('optical') || s.includes('vision') || s.includes('opthalmology')) return 'ophthalmology';
	
	// Default to consultation for general services
	return 'consultation';
}

run();
