import { useState, useEffect, useRef } from "react";
import { Analytics } from '@vercel/analytics/react';

// ── localStorage helpers ──
const store = {
  get: (key) => { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; } catch { return null; } },
  set: (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} },
};

// ── Built-in nutrition database (per 1 serving / unit) — PURE VEG ──
const FOOD_DB = {
  "Roti": { cal: 119, p: 3.5, c: 20, f: 3.5, fib: 2, unit: "piece", emoji: "🫓", cat: "🏠 Home" },
  "Phulka": { cal: 70, p: 2.5, c: 14, f: 0.5, fib: 1.5, unit: "piece", emoji: "🫓", cat: "🏠 Home" },
  "Paratha (plain)": { cal: 280, p: 5, c: 36, f: 13, fib: 2, unit: "piece", emoji: "🫓", cat: "🏠 Home" },
  "Aloo Paratha": { cal: 330, p: 6, c: 42, f: 15, fib: 3, unit: "piece", emoji: "🫓", cat: "🏠 Home" },
  "Bhakri (Jowar)": { cal: 135, p: 4, c: 28, f: 1, fib: 3, unit: "piece", emoji: "🫓", cat: "🏠 Home" },
  "Naan": { cal: 260, p: 7, c: 45, f: 5, fib: 2, unit: "piece", emoji: "🫓", cat: "🏠 Home" },
  "Puri": { cal: 120, p: 2, c: 13, f: 7, fib: 1, unit: "piece", emoji: "🫓", cat: "🏠 Home" },
  "Steamed Rice": { cal: 180, p: 3, c: 40, f: 0.5, fib: 0.5, unit: "bowl", emoji: "🍚", cat: "🏠 Home" },
  "Jeera Rice": { cal: 220, p: 4, c: 42, f: 5, fib: 1, unit: "bowl", emoji: "🍚", cat: "🏠 Home" },
  "Dal Chawal": { cal: 350, p: 12, c: 55, f: 8, fib: 5, unit: "plate", emoji: "🍛", cat: "🏠 Home" },
  "Toor Dal (Amti)": { cal: 150, p: 9, c: 20, f: 4, fib: 4, unit: "bowl", emoji: "🍲", cat: "🥣 Dals", aka: ["amti","toor","arhar dal"] },
  "Moong Dal": { cal: 130, p: 9, c: 18, f: 3, fib: 3, unit: "bowl", emoji: "🍲", cat: "🥣 Dals", aka: ["mung","green gram"] },
  "Masoor Dal": { cal: 140, p: 9, c: 19, f: 3.5, fib: 4, unit: "bowl", emoji: "🍲", cat: "🥣 Dals", aka: ["red lentil"] },
  "Chana Dal": { cal: 160, p: 10, c: 22, f: 4, fib: 5, unit: "bowl", emoji: "🍲", cat: "🥣 Dals", aka: ["bengal gram","harbhara"] },
  "Urad Dal": { cal: 155, p: 10, c: 20, f: 4, fib: 4, unit: "bowl", emoji: "🍲", cat: "🥣 Dals", aka: ["black gram","udid"] },
  "Dal Fry": { cal: 180, p: 10, c: 22, f: 6, fib: 4, unit: "bowl", emoji: "🍲", cat: "🥣 Dals" },
  "Dal Tadka": { cal: 200, p: 10, c: 22, f: 8, fib: 4, unit: "bowl", emoji: "🍲", cat: "🥣 Dals" },
  "Dal Makhani": { cal: 260, p: 11, c: 25, f: 13, fib: 5, unit: "bowl", emoji: "🍲", cat: "🥣 Dals" },
  "Varan (plain)": { cal: 120, p: 8, c: 17, f: 2, fib: 3, unit: "bowl", emoji: "🍲", cat: "🥣 Dals" },
  "Matki Usal": { cal: 170, p: 10, c: 20, f: 5, fib: 5, unit: "bowl", emoji: "🍲", cat: "🥣 Dals", aka: ["matki","moth beans","usal"] },
  "Rajma": { cal: 210, p: 11, c: 30, f: 5, fib: 6, unit: "bowl", emoji: "🍲", cat: "🥣 Dals", aka: ["kidney beans","rajma masala"] },
  "Chole": { cal: 240, p: 10, c: 28, f: 10, fib: 6, unit: "bowl", emoji: "🍲", cat: "🥣 Dals", aka: ["chana masala","chickpea curry"] },
  "Sambar": { cal: 130, p: 6, c: 16, f: 4, fib: 4, unit: "bowl", emoji: "🍲", cat: "🥣 Dals", aka: ["sambhar"] },
  "Misal": { cal: 250, p: 12, c: 28, f: 10, fib: 6, unit: "bowl", emoji: "🍲", cat: "🥣 Dals", aka: ["misal pav without pav","tarri"] },
  "Batata Bhaji (Potato Sabzi)": { cal: 180, p: 3, c: 24, f: 8, fib: 3, unit: "bowl", emoji: "🥔", cat: "🏠 Home", aka: ["potato","aloo","batata"] },
  "Flower Bhaji (Cauliflower Sabzi)": { cal: 140, p: 4, c: 12, f: 8, fib: 4, unit: "bowl", emoji: "🥦", cat: "🏠 Home", aka: ["cauliflower","gobi","phulkopi"] },
  "Bhendi Bhaji (Okra Sabzi)": { cal: 130, p: 3, c: 10, f: 8, fib: 4, unit: "bowl", emoji: "🫑", cat: "🏠 Home", aka: ["okra","bhindi","ladyfinger"] },
  "Vangi Bhaji (Brinjal Sabzi)": { cal: 140, p: 3, c: 12, f: 9, fib: 4, unit: "bowl", emoji: "🍆", cat: "🏠 Home", aka: ["brinjal","eggplant","baingan"] },
  "Aloo Gobi": { cal: 160, p: 4, c: 18, f: 8, fib: 4, unit: "bowl", emoji: "🥔", cat: "🏠 Home" },
  "Kanda Batata Poha": { cal: 250, p: 5, c: 40, f: 8, fib: 2, unit: "plate", emoji: "🥣", cat: "🏠 Home", aka: ["poha","flattened rice"] },
  "Upma": { cal: 230, p: 5, c: 34, f: 8, fib: 2, unit: "plate", emoji: "🥣", cat: "🏠 Home" },
  "Sabudana Khichdi": { cal: 310, p: 4, c: 50, f: 10, fib: 1, unit: "plate", emoji: "🥣", cat: "🏠 Home", aka: ["sabudana","sago","fasting"] },
  "Pithla Bhakri": { cal: 250, p: 10, c: 38, f: 6, fib: 5, unit: "plate", emoji: "🍛", cat: "🏠 Home", aka: ["pitla","besan"] },
  "Bharli Vangi": { cal: 180, p: 4, c: 14, f: 12, fib: 4, unit: "bowl", emoji: "🍆", cat: "🏠 Home", aka: ["stuffed brinjal","stuffed eggplant"] },
  "Zunka Bhakri": { cal: 270, p: 11, c: 38, f: 8, fib: 5, unit: "plate", emoji: "🍛", cat: "🏠 Home", aka: ["zunka","jhunka"] },
  "Usal Pav": { cal: 320, p: 12, c: 40, f: 12, fib: 6, unit: "plate", emoji: "🍛", cat: "🏠 Home", aka: ["usal","sprouted moth"] },
  "Paneer Bhurji": { cal: 280, p: 16, c: 6, f: 22, fib: 1, unit: "bowl", emoji: "🧀", cat: "🏠 Home" },
  "Palak Paneer": { cal: 260, p: 14, c: 10, f: 18, fib: 3, unit: "bowl", emoji: "🧈", cat: "🏠 Home" },
  "Paneer Butter Masala": { cal: 340, p: 14, c: 12, f: 26, fib: 2, unit: "bowl", emoji: "🧈", cat: "🏠 Home" },
  "Bhindi Fry": { cal: 150, p: 3, c: 12, f: 10, fib: 5, unit: "bowl", emoji: "🫑", cat: "🏠 Home" },
  "Mixed Veg Sabzi": { cal: 160, p: 4, c: 16, f: 8, fib: 5, unit: "bowl", emoji: "🥗", cat: "🏠 Home" },
  "Koshimbir (Salad)": { cal: 60, p: 2, c: 8, f: 2, fib: 2, unit: "bowl", emoji: "🥗", cat: "🥗 Salads" },
  "Chana Salad (Kala Chana + Onion + Cucumber)": { cal: 180, p: 10, c: 26, f: 3, fib: 7, unit: "bowl", emoji: "🥗", cat: "🥗 Salads", aka: ["chana salad","chickpea salad","chana chaat","evening salad"] },
  "Sprouts Salad": { cal: 120, p: 8, c: 16, f: 2, fib: 5, unit: "bowl", emoji: "🌱", cat: "🥗 Salads", aka: ["moong sprouts","matki sprouts","sprout chaat"] },
  "Cucumber Salad (Khamang Kakdi)": { cal: 45, p: 1, c: 6, f: 2, fib: 1, unit: "bowl", emoji: "🥒", cat: "🥗 Salads", aka: ["kakdi","cucumber","khamang"] },
  "Onion Tomato Salad": { cal: 35, p: 1, c: 6, f: 1, fib: 1.5, unit: "bowl", emoji: "🧅", cat: "🥗 Salads", aka: ["kanda salad","onion salad"] },
  "Fruit Chaat": { cal: 130, p: 1, c: 30, f: 0.5, fib: 3, unit: "bowl", emoji: "🍇", cat: "🥗 Salads", aka: ["fruit salad"] },
  "Boiled Peanut Chaat": { cal: 160, p: 7, c: 10, f: 10, fib: 3, unit: "bowl", emoji: "🥜", cat: "🥗 Salads", aka: ["shengdana chaat","peanut salad"] },
  "Moong Chaat": { cal: 150, p: 9, c: 20, f: 3, fib: 5, unit: "bowl", emoji: "🌱", cat: "🥗 Salads", aka: ["moong salad","green gram chaat"] },
  "Corn Chaat": { cal: 170, p: 5, c: 28, f: 5, fib: 3, unit: "bowl", emoji: "🌽", cat: "🥗 Salads", aka: ["corn salad","sweet corn chaat","bhutta"] },
  "Paneer Salad": { cal: 200, p: 14, c: 8, f: 13, fib: 2, unit: "bowl", emoji: "🧀", cat: "🥗 Salads", aka: ["paneer chaat"] },
  "Beetroot Salad": { cal: 70, p: 2, c: 14, f: 0.5, fib: 3, unit: "bowl", emoji: "🟣", cat: "🥗 Salads", aka: ["beetroot","beet salad"] },
  "Carrot Cucumber Salad": { cal: 50, p: 1, c: 10, f: 1, fib: 2, unit: "bowl", emoji: "🥕", cat: "🥗 Salads", aka: ["gajar kakdi","carrot salad"] },
  "Rajma Salad": { cal: 190, p: 10, c: 28, f: 3, fib: 7, unit: "bowl", emoji: "🫘", cat: "🥗 Salads", aka: ["kidney bean salad"] },
  "Black Chana Chaat": { cal: 200, p: 11, c: 28, f: 4, fib: 8, unit: "bowl", emoji: "🫘", cat: "🥗 Salads", aka: ["kala chana chaat","harbhara chaat"] },
  "Cabbage Slaw (Kobi Salad)": { cal: 55, p: 1.5, c: 8, f: 2, fib: 3, unit: "bowl", emoji: "🥬", cat: "🥗 Salads", aka: ["kobi salad","cabbage salad","coleslaw"] },
  "Tomato Onion Raita": { cal: 70, p: 3, c: 6, f: 4, fib: 1, unit: "bowl", emoji: "🥛", cat: "🥗 Salads", aka: ["raita","kanda raita"] },
  "Boondi Raita": { cal: 110, p: 4, c: 12, f: 5, fib: 0.5, unit: "bowl", emoji: "🥛", cat: "🥗 Salads", aka: ["raita"] },
  "Mixed Sprouts Bhel": { cal: 180, p: 8, c: 24, f: 6, fib: 5, unit: "bowl", emoji: "🥗", cat: "🥗 Salads", aka: ["sprouts bhel","healthy bhel"] },
  "Peanut Cucumber (Shenga Kakdi)": { cal: 140, p: 6, c: 8, f: 10, fib: 3, unit: "bowl", emoji: "🥜", cat: "🥗 Salads", aka: ["shenga kakdi","peanut kakdi"] },
  "Onion Uttapam (8 inch)": { cal: 300, p: 7, c: 42, f: 11, fib: 3, unit: "piece", emoji: "🥞", cat: "🌿 South Indian", aka: ["uttapam","uttapa","utappa","onion uttapa"] },
  "Plain Dosa": { cal: 130, p: 3, c: 22, f: 3, fib: 1, unit: "piece", emoji: "🥞", cat: "🌿 South Indian" },
  "Masala Dosa": { cal: 280, p: 6, c: 40, f: 10, fib: 3, unit: "piece", emoji: "🥞", cat: "🌿 South Indian" },
  "Idli": { cal: 60, p: 2, c: 12, f: 0.5, fib: 0.5, unit: "piece", emoji: "🥟", cat: "🌿 South Indian" },
  "Medu Vada": { cal: 170, p: 5, c: 15, f: 10, fib: 2, unit: "piece", emoji: "🍩", cat: "🌿 South Indian" },
  "Rava Dosa": { cal: 200, p: 4, c: 28, f: 8, fib: 1, unit: "piece", emoji: "🥞", cat: "🌿 South Indian" },
  "Veg Biryani": { cal: 380, p: 8, c: 55, f: 13, fib: 3, unit: "plate", emoji: "🍛", cat: "🍛 Main" },
  "Rajma Chawal": { cal: 400, p: 14, c: 60, f: 10, fib: 7, unit: "plate", emoji: "🍛", cat: "🍛 Main" },
  "Chole Bhature": { cal: 500, p: 12, c: 55, f: 25, fib: 6, unit: "plate", emoji: "🍛", cat: "🍛 Main" },
  "Pav Bhaji": { cal: 400, p: 10, c: 50, f: 18, fib: 5, unit: "plate", emoji: "🍞", cat: "🍛 Main" },
  "Vada Pav": { cal: 290, p: 5, c: 35, f: 14, fib: 2, unit: "piece", emoji: "🍔", cat: "🍛 Main" },
  "Misal Pav": { cal: 400, p: 14, c: 48, f: 16, fib: 6, unit: "plate", emoji: "🍛", cat: "🍛 Main" },
  "Maggi Noodles": { cal: 310, p: 7, c: 42, f: 13, fib: 2, unit: "packet", emoji: "🍜", cat: "🍛 Main" },
  "Parle-G Biscuit": { cal: 45, p: 0.7, c: 7.5, f: 1.3, fib: 0.2, unit: "biscuit", emoji: "🍪", cat: "🍪 Snacks" },
  "Marie Biscuit": { cal: 28, p: 0.5, c: 5, f: 0.7, fib: 0.2, unit: "biscuit", emoji: "🍪", cat: "🍪 Snacks" },
  "Bourbon Biscuit": { cal: 65, p: 0.8, c: 9, f: 3, fib: 0.3, unit: "biscuit", emoji: "🍪", cat: "🍪 Snacks" },
  "Good Day Biscuit": { cal: 50, p: 0.7, c: 7, f: 2, fib: 0.2, unit: "biscuit", emoji: "🍪", cat: "🍪 Snacks" },
  "Monaco Biscuit": { cal: 25, p: 0.4, c: 3.5, f: 1, fib: 0.1, unit: "biscuit", emoji: "🍪", cat: "🍪 Snacks" },
  "Hide & Seek": { cal: 55, p: 0.7, c: 7.5, f: 2.5, fib: 0.3, unit: "biscuit", emoji: "🍪", cat: "🍪 Snacks" },
  "Oreo Biscuit": { cal: 53, p: 0.5, c: 8, f: 2, fib: 0.3, unit: "biscuit", emoji: "🍪", cat: "🍪 Snacks" },
  "Samosa": { cal: 250, p: 5, c: 28, f: 13, fib: 2, unit: "piece", emoji: "🥟", cat: "🍪 Snacks" },
  "Kachori": { cal: 280, p: 5, c: 30, f: 15, fib: 2, unit: "piece", emoji: "🥟", cat: "🍪 Snacks" },
  "Namkeen / Mixture": { cal: 450, p: 12, c: 50, f: 22, fib: 4, unit: "100g", emoji: "🥜", cat: "🍪 Snacks" },
  "Roasted Peanuts": { cal: 285, p: 13, c: 8, f: 24, fib: 4, unit: "50g handful", emoji: "🥜", cat: "🍪 Snacks" },
  "Cappuccino": { cal: 120, p: 6, c: 10, f: 6, fib: 0, unit: "cup", emoji: "☕", cat: "☕ Cafe" },
  "Cold Coffee + Ice Cream": { cal: 280, p: 6, c: 38, f: 12, fib: 0, unit: "glass", emoji: "🧋", cat: "☕ Cafe" },
  "Latte": { cal: 150, p: 7, c: 13, f: 7, fib: 0, unit: "cup", emoji: "☕", cat: "☕ Cafe" },
  "Veg Club Sandwich": { cal: 350, p: 12, c: 35, f: 16, fib: 3, unit: "piece", emoji: "🥪", cat: "☕ Cafe" },
  "Paneer Sandwich": { cal: 350, p: 14, c: 32, f: 18, fib: 2, unit: "piece", emoji: "🥪", cat: "☕ Cafe" },
  "Pasta Alfredo": { cal: 450, p: 12, c: 52, f: 20, fib: 2, unit: "plate", emoji: "🍝", cat: "☕ Cafe" },
  "Margherita Pizza (2 slices)": { cal: 400, p: 14, c: 44, f: 18, fib: 2, unit: "2 slices", emoji: "🍕", cat: "☕ Cafe" },
  "French Fries": { cal: 310, p: 3, c: 40, f: 15, fib: 3, unit: "plate", emoji: "🍟", cat: "☕ Cafe" },
  "Chocolate Brownie": { cal: 350, p: 4, c: 42, f: 18, fib: 2, unit: "piece", emoji: "🍫", cat: "☕ Cafe" },
  "Garlic Bread": { cal: 200, p: 5, c: 24, f: 9, fib: 1, unit: "2 pieces", emoji: "🧄", cat: "☕ Cafe" },
  "Veg Burger": { cal: 380, p: 10, c: 42, f: 18, fib: 3, unit: "piece", emoji: "🍔", cat: "☕ Cafe" },
  "Chai (with sugar)": { cal: 80, p: 2, c: 12, f: 2.5, fib: 0, unit: "cup", emoji: "☕", cat: "🥤 Drinks" },
  "Chai (no sugar)": { cal: 35, p: 2, c: 3, f: 2, fib: 0, unit: "cup", emoji: "☕", cat: "🥤 Drinks" },
  "Black Coffee": { cal: 5, p: 0, c: 0, f: 0, fib: 0, unit: "cup", emoji: "☕", cat: "🥤 Drinks" },
  "Maaza (250ml)": { cal: 140, p: 0, c: 35, f: 0, fib: 0, unit: "pack", emoji: "🥭", cat: "🥤 Drinks" },
  "Sprite (250ml)": { cal: 100, p: 0, c: 26, f: 0, fib: 0, unit: "can/bottle", emoji: "🥤", cat: "🥤 Drinks" },
  "Coca Cola (250ml)": { cal: 105, p: 0, c: 27, f: 0, fib: 0, unit: "can/bottle", emoji: "🥤", cat: "🥤 Drinks" },
  "Thumbs Up (250ml)": { cal: 110, p: 0, c: 28, f: 0, fib: 0, unit: "can/bottle", emoji: "🥤", cat: "🥤 Drinks" },
  "Lassi (Sweet)": { cal: 180, p: 5, c: 28, f: 5, fib: 0, unit: "glass", emoji: "🥛", cat: "🥤 Drinks" },
  "Buttermilk / Taak": { cal: 19, p: 1, c: 2, f: 0.5, fib: 0, unit: "glass", emoji: "🥛", cat: "🥤 Drinks", aka: ["taak","chaas","mattha","buttermilk"] },
  "Coconut Water": { cal: 45, p: 0, c: 10, f: 0, fib: 0, unit: "glass", emoji: "🥥", cat: "🥤 Drinks" },
  "Nimbu Pani": { cal: 50, p: 0, c: 12, f: 0, fib: 0, unit: "glass", emoji: "🍋", cat: "🥤 Drinks" },
  "Milk (1 glass)": { cal: 115, p: 6, c: 9, f: 7, fib: 0, unit: "glass", emoji: "🥛", cat: "🥤 Drinks" },
  "Budweiser Beer (330ml)": { cal: 145, p: 1, c: 11, f: 0, fib: 0, unit: "bottle", emoji: "🍺", cat: "🍺 Alcohol" },
  "Kingfisher Beer (330ml)": { cal: 140, p: 1, c: 10, f: 0, fib: 0, unit: "bottle", emoji: "🍺", cat: "🍺 Alcohol" },
  "Beer Pint (500ml)": { cal: 215, p: 1.5, c: 16, f: 0, fib: 0, unit: "pint", emoji: "🍺", cat: "🍺 Alcohol" },
  "Whisky (30ml peg)": { cal: 70, p: 0, c: 0, f: 0, fib: 0, unit: "peg", emoji: "🥃", cat: "🍺 Alcohol" },
  "Vodka (30ml)": { cal: 65, p: 0, c: 0, f: 0, fib: 0, unit: "shot", emoji: "🥃", cat: "🍺 Alcohol" },
  "Wine (150ml glass)": { cal: 120, p: 0, c: 4, f: 0, fib: 0, unit: "glass", emoji: "🍷", cat: "🍺 Alcohol" },
  "Apple": { cal: 56, p: 0.3, c: 14, f: 0, fib: 2.5, unit: "piece", emoji: "🍎", cat: "🍌 Fruits" },
  "Banana": { cal: 95, p: 1, c: 23, f: 0, fib: 2.5, unit: "piece", emoji: "🍌", cat: "🍌 Fruits" },
  "Orange": { cal: 53, p: 1, c: 13, f: 0, fib: 2, unit: "piece", emoji: "🍊", cat: "🍌 Fruits" },
  "Mango": { cal: 70, p: 0.5, c: 17, f: 0, fib: 1.5, unit: "piece (medium)", emoji: "🥭", cat: "🍌 Fruits" },
  "Guava": { cal: 66, p: 2.5, c: 14, f: 1, fib: 5, unit: "piece", emoji: "🍈", cat: "🍌 Fruits" },
  "Papaya (bowl)": { cal: 60, p: 0.5, c: 15, f: 0, fib: 2, unit: "bowl", emoji: "🍈", cat: "🍌 Fruits" },
  "Watermelon (bowl)": { cal: 50, p: 0.5, c: 12, f: 0, fib: 0.5, unit: "bowl", emoji: "🍉", cat: "🍌 Fruits" },
  "Chickoo": { cal: 94, p: 0.7, c: 22, f: 1, fib: 5, unit: "piece", emoji: "🟤", cat: "🍌 Fruits" },
  "Pomegranate": { cal: 77, p: 1, c: 18, f: 0, fib: 4, unit: "100g", emoji: "🔴", cat: "🍌 Fruits" },
  "Grapes (bowl)": { cal: 70, p: 0.6, c: 17, f: 0, fib: 1, unit: "bowl", emoji: "🍇", cat: "🍌 Fruits" },
  "Curd / Dahi (bowl)": { cal: 100, p: 4, c: 5, f: 7, fib: 0, unit: "bowl", emoji: "🥛", cat: "🏠 Home" },
  "Protein Shake": { cal: 200, p: 25, c: 15, f: 5, fib: 1, unit: "glass", emoji: "💪", cat: "🥤 Drinks" },
};

const PORTION_SIZES = [
  { label: "Small", mult: 0.6, desc: "Small bowl · half plate" },
  { label: "Regular", mult: 1.0, desc: "1 standard bowl · 1 plate" },
  { label: "Large", mult: 1.5, desc: "Big bowl · loaded plate" },
  { label: "Custom (g)", mult: null, desc: "Enter exact grams" },
];
const FIXED_UNITS = ["biscuit","bottle","can/bottle","peg","shot","packet","piece"];
const MEALS = ["🌅 Breakfast","🌞 Lunch","🌙 Dinner","🍪 Snacks"];
const MEAL_KEYS = ["breakfast","lunch","dinner","snacks"];
const getTodayKey = () => { const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };
const fmtTime = (iso) => new Date(iso).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",hour12:true});
const guessMeal = () => { const h=new Date().getHours(); if(h<11)return 0; if(h<15)return 1; if(h<20)return 2; return 3; };

const Ring = ({value,max,color,label,unit}) => {
  const pct=Math.min((value/max)*100,100), r=26, circ=2*Math.PI*r, off=circ-(pct/100)*circ;
  return (<div style={{textAlign:"center",flex:1}}>
    <svg width="62" height="62" viewBox="0 0 62 62">
      <circle cx="31" cy="31" r={r} fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="4.5"/>
      <circle cx="31" cy="31" r={r} fill="none" stroke={color} strokeWidth="4.5" strokeDasharray={circ} strokeDashoffset={off} strokeLinecap="round" transform="rotate(-90 31 31)" style={{transition:"stroke-dashoffset 0.6s ease"}}/>
      <text x="31" y="29" textAnchor="middle" style={{fontSize:"12px",fontWeight:700,fill:color,fontFamily:"'DM Sans',sans-serif"}}>{Math.round(value)}</text>
      <text x="31" y="40" textAnchor="middle" style={{fontSize:"8px",fill:"#aaa",fontFamily:"'DM Sans',sans-serif"}}>{unit}</text>
    </svg>
    <div style={{fontSize:"10px",color:"#999",marginTop:1,fontWeight:500}}>{label}</div>
  </div>);
};

export default function App() {
  const [entries,setEntries]=useState([]);
  const [view,setView]=useState("home");
  const [searchText,setSearchText]=useState("");
  const [selectedFood,setSelectedFood]=useState(null);
  const [qty,setQty]=useState(1);
  const [portion,setPortion]=useState(1);
  const [customG,setCustomG]=useState("");
  const [mealIdx,setMealIdx]=useState(guessMeal);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");
  const [histDates,setHistDates]=useState([]);
  const [histData,setHistData]=useState(null);
  const [activeCat,setActiveCat]=useState("All");
  const [showLegend,setShowLegend]=useState(false);
  const [calGoal,setCalGoal]=useState(()=>store.get("calorie-goal")||2200);
  const [goalInput,setGoalInput]=useState(()=>String(store.get("calorie-goal")||2200));
  const [plan,setPlan]=useState(null);
  const [planLoading,setPlanLoading]=useState(false);
  const inputRef=useRef(null);
  const today=getTodayKey();

  // Load today's entries
  useEffect(()=>{
    const saved=store.get(`log:${today}`);
    if(saved)setEntries(saved);
    const savedPlan=store.get(`plan:${today}`);
    if(savedPlan)setPlan(savedPlan);
  },[today]);

  // Save entries on change
  useEffect(()=>{
    store.set(`log:${today}`,entries);
    const dates=store.get("log-dates")||[];
    if(!dates.includes(today)){dates.push(today);store.set("log-dates",dates);}
  },[entries,today]);

  const totals=entries.reduce((a,e)=>({cal:a.cal+(e.cal||0),p:a.p+(e.p||0),c:a.c+(e.c||0),f:a.f+(e.f||0),fib:a.fib+(e.fib||0)}),{cal:0,p:0,c:0,f:0,fib:0});
  const mealTotals=MEAL_KEYS.map((mk,i)=>{const me=entries.filter(e=>e.meal===mk);return{key:mk,label:MEALS[i],entries:me,cal:me.reduce((s,e)=>s+(e.cal||0),0)};});
  const untagged=entries.filter(e=>!e.meal||!MEAL_KEYS.includes(e.meal));
  if(untagged.length>0)mealTotals.push({key:"other",label:"📝 Other",entries:untagged,cal:untagged.reduce((s,e)=>s+(e.cal||0),0)});

  const foodNames=Object.keys(FOOD_DB);
  const findDBMatch=(text)=>{const q=text.toLowerCase().trim();if(FOOD_DB[text])return text;const nm=foodNames.find(n=>n.toLowerCase()===q);if(nm)return nm;const am=foodNames.find(n=>{const d=FOOD_DB[n];return d.aka&&d.aka.some(a=>a===q);});if(am)return am;const subs=foodNames.filter(n=>n.toLowerCase().includes(q)||(FOOD_DB[n].aka&&FOOD_DB[n].aka.some(a=>a.includes(q))));if(subs.length===1)return subs[0];return null;};

  const addFromDB=(foodName)=>{
    const d=FOOD_DB[foodName];if(!d)return;
    const isFixed=FIXED_UNITS.includes(d.unit);
    const m=isFixed?1:(PORTION_SIZES[portion].mult||((parseInt(customG)||100)/100));
    const pLabel=isFixed?`${qty} ${d.unit}${qty>1?"s":""}`:`${PORTION_SIZES[portion].label}${qty>1?` ×${qty}`:""}`;
    setEntries(prev=>[...prev,{id:Date.now(),time:new Date().toISOString(),meal:MEAL_KEYS[mealIdx],name:qty>1?`${foodName} ×${qty}`:foodName,portion:pLabel,unit:d.unit,cal:Math.round(d.cal*m*qty),p:Math.round(d.p*m*qty),c:Math.round(d.c*m*qty),f:Math.round(d.f*m*qty),fib:Math.round(d.fib*m*qty)}]);
    resetAdd();
  };

  const callAI=async(prompt)=>{
    const res=await fetch("/api/lookup",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt})});
    const data=await res.json();
    if(data.error)throw new Error(data.error);
    return data.text;
  };

  const lookupAI=async(foodName)=>{
    setLoading(true);setError("");
    try{
      const pi=PORTION_SIZES[portion];const pt=pi.mult===null?`${customG||100}g`:`${pi.label} serving`;
      const txt=await callAI(`I ate ${qty}× "${foodName}" — portion: ${pt}. I am PURE VEGETARIAN (no eggs, no meat, no fish). Likely Indian food or cafe food from India.\nReturn ONLY valid JSON: {"food_name":"...","portion":"...","calories":N,"protein":N,"carbs":N,"fat":N,"fiber":N}\nBe accurate. Return ONLY JSON.`);
      const parsed=JSON.parse(txt.replace(/```json|```/g,"").trim());
      setEntries(prev=>[...prev,{id:Date.now(),time:new Date().toISOString(),meal:MEAL_KEYS[mealIdx],name:parsed.food_name||foodName,portion:parsed.portion||pt,unit:"serving",cal:Math.round(parsed.calories||0),p:Math.round(parsed.protein||0),c:Math.round(parsed.carbs||0),f:Math.round(parsed.fat||0),fib:Math.round(parsed.fiber||0)}]);
      resetAdd();
    }catch(e){console.error(e);setError("Couldn't look up. Try rephrasing, or check API key in Vercel settings.");}
    setLoading(false);
  };

  const logFood=()=>{if(selectedFood&&FOOD_DB[selectedFood]){addFromDB(selectedFood);return;}const match=findDBMatch(searchText.trim());if(match){addFromDB(match);return;}if(searchText.trim())lookupAI(searchText.trim());};
  const resetAdd=()=>{setSearchText("");setSelectedFood(null);setQty(1);setPortion(1);setCustomG("");setError("");setMealIdx(guessMeal());setView("home");};
  const del=(id)=>setEntries(prev=>prev.filter(e=>e.id!==id));
  const clearToday=()=>{if(window.confirm("Clear all entries for today?"))setEntries([]);};
  const saveGoal=(val)=>{const n=parseInt(val);if(isNaN(n)||n<500||n>6000)return;setCalGoal(n);store.set("calorie-goal",n);setView("home");};

  const generatePlan=async()=>{
    setPlanLoading(true);
    try{
      const remaining=calGoal-totals.cal;
      const logged=entries.length>0?`\nAlready eaten today (${Math.round(totals.cal)} kcal): ${entries.map(e=>e.name).join(", ")}`:"";
      const txt=await callAI(`I'm on a ${calGoal} kcal/day diet.${logged}\nRemaining budget: ${remaining} kcal.\nI am PURE VEGETARIAN (no eggs, no meat, no fish). I eat Indian food (Marathi home food, cafe food, south Indian). I usually have a chana/sprouts salad with onion, cucumber, salt, pepper in the evening.\nReturn ONLY valid JSON:\n{"breakfast":{"items":["food1","food2"],"cal":N,"note":"tip"},"lunch":{"items":["food1"],"cal":N,"note":"tip"},"dinner":{"items":["food1"],"cal":N,"note":"tip"},"snacks":{"items":["food1"],"cal":N,"note":"tip"},"total_cal":N,"tip":"overall tip"}\n${entries.length>0?"Skip meals already covered.":"Plan a full day."} Total ~${entries.length>0?remaining:calGoal} kcal. Return ONLY JSON.`);
      const parsed=JSON.parse(txt.replace(/```json|```/g,"").trim());
      setPlan(parsed);store.set(`plan:${today}`,parsed);
    }catch(e){console.error(e);}
    setPlanLoading(false);
  };

  const loadHistory=()=>{const dates=store.get("log-dates")||[];setHistDates(dates.filter(d=>d!==today).sort().reverse());setView("history");};
  const loadDay=(dk)=>{const e=store.get(`log:${dk}`)||[];const t=e.reduce((a,x)=>({cal:a.cal+(x.cal||0),p:a.p+(x.p||0),c:a.c+(x.c||0),f:a.f+(x.f||0),fib:a.fib+(x.fib||0)}),{cal:0,p:0,c:0,f:0,fib:0});setHistData({date:dk,entries:e,totals:t});};

  const categories=["All",...new Set(Object.values(FOOD_DB).map(v=>v.cat))];
  const filtered=foodNames.filter(n=>{const d=FOOD_DB[n];const q=searchText.toLowerCase();const mc=searchText?true:(activeCat==="All"||d.cat===activeCat);const ms=!searchText||n.toLowerCase().includes(q)||(d.aka&&d.aka.some(a=>a.includes(q)));return mc&&ms;});
  const calPct=Math.min((totals.cal/calGoal)*100,100);

  const bg="#faf7f2",card="#ffffff",accent="#e07a2f",accentLt="#fdf0e4",green="#4caf7d",red="#e05252",blue="#5b8fd9";
  const t1="#2a2118",t2="#7a6e60",t3="#b5a998",shadow="0 2px 16px rgba(42,33,24,0.06)";
  const font="'DM Sans',sans-serif";
  const mealColors={breakfast:"#f0a94e",lunch:"#e07a2f",dinner:"#8b5e3c",snacks:"#c4956a",other:"#999"};

  const getCurFood=()=>selectedFood||findDBMatch(searchText.trim());
  const getCurDB=()=>{const f=getCurFood();return f?FOOD_DB[f]:null;};
  const isFixed=()=>{const db=getCurDB();return db&&FIXED_UNITS.includes(db.unit);};
  const estCal=()=>{const db=getCurDB();if(!db)return null;const m=isFixed()?1:(PORTION_SIZES[portion].mult||((parseInt(customG)||100)/100));return Math.round(db.cal*m*qty);};

  return (
    <div style={{fontFamily:font,background:bg,minHeight:"100vh",maxWidth:430,margin:"0 auto",color:t1,position:"relative",paddingBottom:80}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,500;0,9..40,700;1,9..40,400&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet"/>

      {/* ══ HOME ══ */}
      {view==="home"&&(<div style={{padding:"0 16px"}}>
        <div style={{padding:"22px 0 6px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:11,color:t3,fontWeight:500,letterSpacing:1,textTransform:"uppercase"}}>{new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"short"})}</div>
            <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:24,margin:"4px 0 0",fontWeight:700}}>My Food Journal 🍛</h1>
          </div>
          <div style={{display:"flex",gap:6}}>
            <button onClick={()=>setView("settings")} style={{background:"none",border:`1.5px solid ${t3}`,borderRadius:10,padding:"6px 10px",fontSize:11,color:t2,cursor:"pointer",fontWeight:600,fontFamily:font}}>⚙️</button>
            <button onClick={loadHistory} style={{background:"none",border:`1.5px solid ${t3}`,borderRadius:10,padding:"6px 10px",fontSize:11,color:t2,cursor:"pointer",fontWeight:600,fontFamily:font}}>📅</button>
          </div>
        </div>
        <div style={{background:card,borderRadius:18,padding:"18px",marginTop:12,boxShadow:shadow}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline"}}>
            <span style={{fontSize:12,color:t2,fontWeight:500}}>Today's Calories</span>
            <button onClick={()=>setView("settings")} style={{background:"none",border:"none",fontSize:12,color:accent,cursor:"pointer",fontWeight:600,fontFamily:font,padding:0}}>{Math.round(totals.cal)} / {calGoal} kcal ✎</button>
          </div>
          <div style={{height:9,background:"#f0ebe4",borderRadius:8,marginTop:8,overflow:"hidden"}}>
            <div style={{height:"100%",borderRadius:8,width:`${calPct}%`,background:calPct>100?red:calPct>85?`linear-gradient(90deg,${accent},${red})`:`linear-gradient(90deg,${accent},#f0a94e)`,transition:"width 0.5s ease"}}/>
          </div>
          <div style={{display:"flex",marginTop:14,gap:2}}>
            <Ring value={totals.p} max={120} color={blue} label="Protein" unit="g"/>
            <Ring value={totals.c} max={300} color={accent} label="Carbs" unit="g"/>
            <Ring value={totals.f} max={75} color="#d65f8a" label="Fat" unit="g"/>
            <Ring value={totals.fib} max={35} color={green} label="Fiber" unit="g"/>
          </div>
        </div>
        <button onClick={()=>setView("plan")} style={{width:"100%",marginTop:12,padding:"13px",borderRadius:13,border:`1.5px solid ${accent}`,background:accentLt,color:accent,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:font,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
          📋 Plan My Day — {calGoal-Math.round(totals.cal)} kcal remaining
        </button>
        <div style={{marginTop:20}}>
          {entries.length===0&&<div style={{textAlign:"center",padding:"30px 0",color:t3,fontSize:13}}>Nothing logged yet — tap + to start</div>}
          {mealTotals.map(mt=>{if(mt.entries.length===0)return null;return(<div key={mt.key} style={{marginBottom:16}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
              <span style={{fontSize:13,fontWeight:700,color:mealColors[mt.key]||t1}}>{mt.label}</span>
              <span style={{fontSize:11,color:t3,fontWeight:600}}>{mt.cal} kcal</span>
            </div>
            {mt.entries.map(e=>(<div key={e.id} style={{background:card,borderRadius:12,padding:"11px 13px",marginBottom:6,boxShadow:"0 1px 6px rgba(42,33,24,0.04)",display:"flex",alignItems:"center",borderLeft:`3px solid ${mealColors[mt.key]||t3}`}}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{e.name}</div>
                <div style={{fontSize:10,color:t3,marginTop:1}}>{e.portion} · {fmtTime(e.time)}</div>
                <div style={{fontSize:10,color:t2,marginTop:2}}>P {e.p}g · C {e.c}g · F {e.f}g · Fib {e.fib}g</div>
              </div>
              <div style={{textAlign:"right",marginLeft:10,flexShrink:0}}>
                <div style={{fontSize:16,fontWeight:700,color:accent}}>{e.cal}</div>
                <div style={{fontSize:9,color:t3}}>kcal</div>
              </div>
              <button onClick={()=>del(e.id)} style={{background:"none",border:"none",fontSize:14,color:t3,cursor:"pointer",marginLeft:5,padding:2}}>×</button>
            </div>))}
          </div>);})}
          {entries.length>0&&<button onClick={clearToday} style={{width:"100%",marginTop:4,padding:"10px",borderRadius:10,background:"transparent",border:"1px solid #e8ddd0",color:t3,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:font}}>🗑 Clear Today's Log</button>}
        </div>
      </div>)}

      {/* ══ SETTINGS ══ */}
      {view==="settings"&&(<div style={{padding:"0 16px"}}>
        <div style={{padding:"18px 0 6px",display:"flex",alignItems:"center",gap:10}}>
          <button onClick={()=>setView("home")} style={{background:"none",border:"none",fontSize:20,cursor:"pointer",padding:0,color:t1}}>←</button>
          <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:20,margin:0,fontWeight:700}}>Settings</h2>
        </div>
        <div style={{background:card,borderRadius:16,padding:"20px 18px",marginTop:12,boxShadow:shadow}}>
          <div style={{fontSize:13,fontWeight:700,color:t1,marginBottom:4}}>🎯 Daily Calorie Goal</div>
          <div style={{fontSize:11,color:t3,marginBottom:14}}>1200 (aggressive cut) · 1500 (moderate) · 2000 (maintenance) · 2500 (bulk)</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14}}>
            {[1200,1500,1800,2000,2200,2500].map(g=>(<button key={g} onClick={()=>setGoalInput(String(g))} style={{padding:"10px 16px",borderRadius:10,fontSize:13,fontWeight:700,fontFamily:font,border:parseInt(goalInput)===g?`2px solid ${accent}`:"2px solid #f0ebe4",background:parseInt(goalInput)===g?accentLt:card,color:parseInt(goalInput)===g?accent:t2,cursor:"pointer"}}>{g}</button>))}
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <input type="number" value={goalInput} onChange={e=>setGoalInput(e.target.value)} style={{flex:1,padding:"12px 14px",borderRadius:10,border:"1.5px solid #e0d8ce",fontSize:15,fontFamily:font,fontWeight:700,outline:"none",background:card,color:t1}}/>
            <span style={{fontSize:13,color:t3}}>kcal</span>
          </div>
          <button onClick={()=>saveGoal(goalInput)} style={{width:"100%",marginTop:14,padding:"14px",borderRadius:12,background:`linear-gradient(135deg,${accent},#d4691a)`,color:"#fff",fontSize:14,fontWeight:700,border:"none",cursor:"pointer",fontFamily:font,boxShadow:"0 4px 16px rgba(224,122,47,0.35)"}}>Save Goal</button>
        </div>
      </div>)}

      {/* ══ PLAN ══ */}
      {view==="plan"&&(<div style={{padding:"0 16px"}}>
        <div style={{padding:"18px 0 6px",display:"flex",alignItems:"center",gap:10}}>
          <button onClick={()=>setView("home")} style={{background:"none",border:"none",fontSize:20,cursor:"pointer",padding:0,color:t1}}>←</button>
          <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:20,margin:0,fontWeight:700}}>Plan My Day</h2>
        </div>
        <div style={{background:card,borderRadius:14,padding:"16px",marginTop:8,boxShadow:shadow,display:"flex",justifyContent:"space-around",textAlign:"center"}}>
          <div><div style={{fontSize:22,fontWeight:700,color:accent}}>{calGoal}</div><div style={{fontSize:10,color:t3}}>Goal</div></div>
          <div style={{width:1,background:"#f0ebe4"}}/>
          <div><div style={{fontSize:22,fontWeight:700,color:t1}}>{Math.round(totals.cal)}</div><div style={{fontSize:10,color:t3}}>Eaten</div></div>
          <div style={{width:1,background:"#f0ebe4"}}/>
          <div><div style={{fontSize:22,fontWeight:700,color:calGoal-totals.cal>0?green:red}}>{calGoal-Math.round(totals.cal)}</div><div style={{fontSize:10,color:t3}}>Left</div></div>
        </div>
        <button onClick={generatePlan} disabled={planLoading} style={{width:"100%",marginTop:12,padding:"14px",borderRadius:12,background:planLoading?t3:`linear-gradient(135deg,${accent},#d4691a)`,color:"#fff",fontSize:14,fontWeight:700,border:"none",cursor:planLoading?"wait":"pointer",fontFamily:font,boxShadow:planLoading?"none":"0 4px 16px rgba(224,122,47,0.35)"}}>
          {planLoading?"⏳ Planning...":plan?"🔄 Refresh Plan":"✨ Generate Meal Plan"}
        </button>
        {plan&&!planLoading&&(<div style={{marginTop:16}}>
          {["breakfast","lunch","dinner","snacks"].map((meal,i)=>{const m=plan[meal];if(!m||!m.items||!m.items.length)return null;const mc=[mealColors.breakfast,mealColors.lunch,mealColors.dinner,mealColors.snacks][i];return(<div key={meal} style={{background:card,borderRadius:14,padding:"14px 16px",marginBottom:10,boxShadow:"0 1px 8px rgba(42,33,24,0.05)",borderLeft:`3px solid ${mc}`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <span style={{fontSize:14,fontWeight:700,color:mc}}>{"🌅🌞🌙🍪"[i]} {meal[0].toUpperCase()+meal.slice(1)}</span>
              <span style={{fontSize:12,fontWeight:700,color:accent}}>{m.cal} kcal</span>
            </div>
            {m.items.map((item,j)=>(<div key={j} style={{fontSize:13,color:t1,padding:"4px 0",borderBottom:j<m.items.length-1?"1px solid #f8f4ee":"none"}}>• {item}</div>))}
            {m.note&&<div style={{fontSize:11,color:t3,marginTop:6,fontStyle:"italic"}}>💡 {m.note}</div>}
          </div>);})}
          {plan.tip&&<div style={{background:accentLt,borderRadius:12,padding:"12px 14px",marginTop:4,border:"1px solid #f0d8be"}}><div style={{fontSize:12,fontWeight:700,color:accent,marginBottom:2}}>🧠 Pro Tip</div><div style={{fontSize:12,color:t1}}>{plan.tip}</div></div>}
        </div>)}
      </div>)}

      {/* ══ ADD FOOD ══ */}
      {view==="add"&&(<div style={{padding:"0 16px"}}>
        <div style={{padding:"18px 0 6px",display:"flex",alignItems:"center",gap:10}}>
          <button onClick={resetAdd} style={{background:"none",border:"none",fontSize:20,cursor:"pointer",padding:0,color:t1}}>←</button>
          <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:20,margin:0,fontWeight:700}}>Add Food</h2>
        </div>
        <div style={{background:card,borderRadius:13,padding:"3px 8px",boxShadow:shadow,display:"flex",alignItems:"center",marginTop:6}}>
          <span style={{fontSize:16,padding:"0 6px"}}>🔍</span>
          <input ref={inputRef} type="text" placeholder="Type food... e.g. poha, samosa" value={searchText} onChange={e=>{setSearchText(e.target.value);setSelectedFood(null);}} onKeyDown={e=>{if(e.key==="Enter"&&(selectedFood||searchText.trim()))logFood();}} style={{border:"none",outline:"none",flex:1,padding:"13px 4px",fontSize:14,fontFamily:font,background:"transparent",color:t1}}/>
          {searchText&&<button onClick={()=>{setSearchText("");setSelectedFood(null);}} style={{background:"none",border:"none",fontSize:16,color:t3,cursor:"pointer",padding:4}}>×</button>}
        </div>
        <div style={{marginTop:12}}>
          <div style={{fontSize:11,fontWeight:600,color:t2,textTransform:"uppercase",letterSpacing:0.8,marginBottom:6}}>Meal</div>
          <div style={{display:"flex",gap:5}}>
            {MEALS.map((m,i)=>(<button key={i} onClick={()=>setMealIdx(i)} style={{flex:1,padding:"9px 4px",borderRadius:10,fontSize:11,fontWeight:600,fontFamily:font,border:mealIdx===i?`2px solid ${Object.values(mealColors)[i]}`:"2px solid transparent",background:mealIdx===i?accentLt:"#f5f0ea",color:mealIdx===i?Object.values(mealColors)[i]:t2,cursor:"pointer",textAlign:"center"}}>{m.split(" ")[0]}<br/><span style={{fontSize:10}}>{m.split(" ")[1]}</span></button>))}
          </div>
        </div>
        <div style={{marginTop:12,display:"flex",alignItems:"center",gap:14}}>
          <div style={{fontSize:11,fontWeight:600,color:t2,textTransform:"uppercase",letterSpacing:0.8}}>Qty</div>
          <div style={{display:"flex",alignItems:"center",background:"#f5f0ea",borderRadius:10,overflow:"hidden"}}>
            <button onClick={()=>setQty(Math.max(1,qty-1))} style={{width:36,height:36,border:"none",background:qty>1?accentLt:"transparent",fontSize:18,fontWeight:700,color:qty>1?accent:t3,cursor:"pointer",fontFamily:font}}>−</button>
            <span style={{width:36,textAlign:"center",fontSize:16,fontWeight:700,color:t1}}>{qty}</span>
            <button onClick={()=>setQty(qty+1)} style={{width:36,height:36,border:"none",background:accentLt,fontSize:18,fontWeight:700,color:accent,cursor:"pointer",fontFamily:font}}>+</button>
          </div>
          {getCurDB()&&<span style={{fontSize:11,color:t3}}>× {getCurDB().unit}</span>}
        </div>
        {isFixed()?(<div style={{marginTop:10,fontSize:11,color:t3,background:"#f8f4ee",borderRadius:8,padding:"8px 12px"}}>📌 Fixed unit ({getCurDB().unit}) — use <b>qty</b> to adjust</div>):(<div style={{marginTop:12}}>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <span style={{fontSize:11,fontWeight:600,color:t2,textTransform:"uppercase",letterSpacing:0.8}}>Portion</span>
            <button onClick={()=>setShowLegend(!showLegend)} style={{background:"none",border:`1px solid ${t3}`,borderRadius:20,width:18,height:18,fontSize:10,color:t2,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>?</button>
          </div>
          {showLegend&&<div style={{background:accentLt,borderRadius:10,padding:"10px 12px",marginTop:5,marginBottom:6,border:"1px solid #f0d8be"}}><div style={{fontSize:11,fontWeight:700,color:accent,marginBottom:4}}>📏 Portion guide</div>{PORTION_SIZES.map((p,i)=>(<div key={i} style={{fontSize:11,color:t1,marginBottom:2}}><b>{p.label}:</b> <span style={{color:t2}}>{p.desc}</span></div>))}</div>}
          <div style={{display:"flex",gap:5,flexWrap:"wrap",marginTop:5}}>
            {PORTION_SIZES.map((p,i)=>(<button key={i} onClick={()=>setPortion(i)} style={{padding:"7px 12px",borderRadius:9,fontSize:11,fontWeight:600,fontFamily:font,border:portion===i?`2px solid ${accent}`:"2px solid transparent",background:portion===i?accentLt:"#f5f0ea",color:portion===i?accent:t2,cursor:"pointer"}}>{p.label}</button>))}
          </div>
          {portion===3&&<input type="number" placeholder="Enter grams" value={customG} onChange={e=>setCustomG(e.target.value)} style={{marginTop:6,width:"100%",padding:"11px 12px",borderRadius:9,border:"1.5px solid #e0d8ce",fontSize:13,fontFamily:font,boxSizing:"border-box",outline:"none",background:card}}/>}
        </div>)}
        {(selectedFood||searchText.trim())&&(<>
          <button onClick={logFood} disabled={loading} style={{width:"100%",marginTop:12,padding:"14px",borderRadius:13,background:loading?t3:`linear-gradient(135deg,${accent},#d4691a)`,color:"#fff",fontSize:13,fontWeight:700,border:"none",cursor:loading?"wait":"pointer",fontFamily:font,boxShadow:loading?"none":"0 4px 16px rgba(224,122,47,0.35)"}}>
            {loading?"⏳ Looking up...":<>Log {qty>1?qty+"× ":""}{selectedFood||searchText.trim()} → {MEALS[mealIdx]}{estCal()?` · ~${estCal()} kcal`:""}</>}
          </button>
          {!selectedFood&&searchText.trim()&&!findDBMatch(searchText.trim())&&<div style={{fontSize:10,color:t3,marginTop:3,textAlign:"center"}}>Not in database — AI will look up</div>}
          {!selectedFood&&searchText.trim()&&findDBMatch(searchText.trim())&&<div style={{fontSize:10,color:green,marginTop:3,textAlign:"center"}}>✓ Found — instant log!</div>}
          {error&&<div style={{marginTop:6,padding:"10px 14px",borderRadius:9,background:"#fde8e8",color:red,fontSize:12}}>{error}</div>}
        </>)}
        <div style={{marginTop:14}}>
          <div style={{fontSize:11,fontWeight:600,color:t2,marginBottom:6,textTransform:"uppercase",letterSpacing:0.8}}>Quick Add</div>
          <div style={{display:"flex",gap:5,marginBottom:8,overflowX:"auto",paddingBottom:4,WebkitOverflowScrolling:"touch"}}>
            {categories.map(cat=>(<button key={cat} onClick={()=>setActiveCat(cat)} style={{padding:"6px 14px",borderRadius:20,fontSize:11,fontWeight:600,fontFamily:font,border:"none",whiteSpace:"nowrap",cursor:"pointer",background:activeCat===cat?t1:"#f0ebe4",color:activeCat===cat?"#fff":t2}}>{cat}</button>))}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
            {filtered.slice(0,30).map(name=>{const d=FOOD_DB[name];const sel=selectedFood===name;return(<button key={name} onClick={()=>{setSelectedFood(sel?null:name);setSearchText(name);}} style={{background:sel?accentLt:card,border:sel?`1.5px solid ${accent}`:"1.5px solid #f0ebe4",borderRadius:11,padding:"10px 10px 8px",textAlign:"left",cursor:"pointer",fontFamily:font}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:17}}>{d.emoji}</span><span style={{fontSize:10,color:accent,fontWeight:700}}>{d.cal}</span></div>
              <div style={{fontSize:11,fontWeight:600,color:t1,marginTop:3,lineHeight:1.3}}>{name}</div>
              <div style={{fontSize:9,color:t3,marginTop:1}}>per {d.unit}</div>
            </button>);})}
          </div>
          {filtered.length===0&&searchText.trim()&&<div style={{textAlign:"center",padding:20,color:t3,fontSize:12}}>Not in picks — tap Log for AI lookup</div>}
        </div>
      </div>)}

      {/* ══ HISTORY ══ */}
      {view==="history"&&(<div style={{padding:"0 16px"}}>
        <div style={{padding:"18px 0 6px",display:"flex",alignItems:"center",gap:10}}>
          <button onClick={()=>{setView("home");setHistData(null);}} style={{background:"none",border:"none",fontSize:20,cursor:"pointer",padding:0,color:t1}}>←</button>
          <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:20,margin:0,fontWeight:700}}>History</h2>
        </div>
        {!histData?(<div>
          {histDates.length===0&&<div style={{textAlign:"center",padding:40,color:t3,fontSize:13}}>No past logs yet.</div>}
          {histDates.map(d=>(<button key={d} onClick={()=>loadDay(d)} style={{display:"block",width:"100%",background:card,borderRadius:11,padding:"14px 16px",marginBottom:7,border:"none",textAlign:"left",cursor:"pointer",fontFamily:font,boxShadow:"0 1px 6px rgba(42,33,24,0.04)"}}>{new Date(d+"T00:00").toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short",year:"numeric"})}</button>))}
        </div>):(<div>
          <button onClick={()=>setHistData(null)} style={{background:"none",border:"none",fontSize:12,color:accent,cursor:"pointer",padding:0,fontWeight:600,fontFamily:font,marginBottom:10}}>← Back</button>
          <div style={{fontSize:15,fontWeight:700,marginBottom:10,fontFamily:"'Playfair Display',serif"}}>{new Date(histData.date+"T00:00").toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long"})}</div>
          <div style={{background:card,borderRadius:13,padding:14,boxShadow:shadow,marginBottom:14}}>
            <div style={{fontSize:26,fontWeight:700,color:accent}}>{Math.round(histData.totals.cal)} <span style={{fontSize:13,color:t3}}>kcal</span></div>
            <div style={{fontSize:11,color:t2,marginTop:4}}>P {Math.round(histData.totals.p)}g · C {Math.round(histData.totals.c)}g · F {Math.round(histData.totals.f)}g · Fib {Math.round(histData.totals.fib)}g</div>
          </div>
          {histData.entries.map(e=>(<div key={e.id} style={{background:card,borderRadius:11,padding:"10px 12px",marginBottom:5,boxShadow:"0 1px 4px rgba(42,33,24,0.03)",display:"flex",justifyContent:"space-between",borderLeft:`3px solid ${mealColors[e.meal]||t3}`}}>
            <div><div style={{fontSize:12,fontWeight:600}}>{e.name}</div><div style={{fontSize:10,color:t3}}>{e.meal?MEALS[MEAL_KEYS.indexOf(e.meal)]:"—"} · {e.portion} · {fmtTime(e.time)}</div></div>
            <div style={{fontSize:15,fontWeight:700,color:accent}}>{e.cal}</div>
          </div>))}
        </div>)}
      </div>)}

      {/* ══ FAB ══ */}
      {(view==="home"||view==="plan")&&(<button onClick={()=>{setMealIdx(guessMeal());setView("add");setTimeout(()=>inputRef.current?.focus(),200);}} style={{position:"fixed",bottom:22,left:"50%",transform:"translateX(-50%)",width:58,height:58,borderRadius:"50%",border:"none",background:`linear-gradient(135deg,${accent},#d4691a)`,color:"#fff",fontSize:28,fontWeight:300,cursor:"pointer",boxShadow:"0 6px 24px rgba(224,122,47,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100}}>+</button>)}
      <Analytics />
    </div>
  );
}
