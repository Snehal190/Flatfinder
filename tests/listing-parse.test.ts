import { describe, expect, it } from "vitest";
import { parseAmount, parseListing } from "@/lib/listing-parse";

describe("listing URL parsing", () => {
  it("reads 99acres slugs", () => {
    const p = parseListing(
      "https://www.99acres.com/3-bhk-bedroom-apartment-flat-for-rent-in-kesar-heights-baner-pune-1380-sq-ft-r4-spid-R12345678",
      "",
    );
    expect(p).toMatchObject({ site: "99acres", bhk: 3, areaId: "baner", carpetSqft: 1380 });
    expect(p.title).toBe("3BHK in Baner (99acres)");
  });

  it("reads NoBroker slugs including rent", () => {
    const p = parseListing("https://www.nobroker.in/property/3-bhk-apartment-for-rent-in-pimple-saudagar-pune-for-rs-42000/8a9f", "");
    expect(p).toMatchObject({ site: "NoBroker", bhk: 3, areaId: "pimple_saudagar", rentMonthly: 42000 });
  });

  it("reads MagicBricks and Housing.com slugs", () => {
    expect(
      parseListing("https://www.magicbricks.com/propertyDetails/3-BHK-1350-Sq-ft-Multistorey-Apartment-FOR-Rent-Balewadi-in-Pune&id=4d42", ""),
    ).toMatchObject({ site: "MagicBricks", bhk: 3, areaId: "balewadi", carpetSqft: 1350 });
    expect(parseListing("https://housing.com/rent/12345678-3-bhk-apartment-for-rent-in-magarpatta-pune", "")).toMatchObject({
      site: "Housing.com",
      areaId: "hadapsar",
    });
  });

  it("copes with junk input", () => {
    expect(parseListing("not a url", "")).toEqual({ amenities: [], lifestyle: [], notAllowed: [] });
  });
});

describe("listing text parsing", () => {
  const text = `Spacious 3 BHK semi furnished flat in Wakad for rent.
    Rent: ₹45,000 per month. Security deposit 1.5 lakh.
    5th floor out of 12 floors, 2 lifts. 3 bathrooms, 2 balconies.
    Covered car parking and two wheeler parking. 24x7 security, power backup.
    Vegetarians only. No pets. Supermarket nearby.`;
  const p = parseListing("", text);

  it("finds money, floor and rooms", () => {
    expect(p).toMatchObject({ bhk: 3, areaId: "wakad", rentMonthly: 45000, deposit: 150000, floor: 5, totalFloors: 12, hasLift: true, bathrooms: 3, furnishing: "semi" });
  });

  it("finds amenities and respects negations", () => {
    expect(p.amenities).toEqual(expect.arrayContaining(["balcony", "parking_car", "parking_2w", "gated", "power_backup"]));
    expect(p.amenities).not.toContain("pet_friendly");
    expect(p.notAllowed).toEqual(expect.arrayContaining(["pet_friendly", "nonveg"]));
    expect(p.lifestyle).toContain("near_groceries");
  });

  it("reads 'no lift' and ground floor", () => {
    expect(parseListing("", "Ground floor flat, no lift needed")).toMatchObject({ floor: 0, hasLift: false });
    expect(parseListing("", "4th floor walk-up, building without lift")).toMatchObject({ floor: 4, hasLift: false });
  });

  it("parses amounts with units", () => {
    expect(parseAmount("45,000")).toBe(45000);
    expect(parseAmount("45", "k")).toBe(45000);
    expect(parseAmount("1.5", "lac")).toBe(150000);
  });
});
