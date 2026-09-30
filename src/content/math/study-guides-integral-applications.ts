import type { MathStudyGuide } from "./study-guides";

export const MATH_INTEGRAL_APPLICATION_GUIDES: Record<string, MathStudyGuide> = {
  "math.m7.l1": {
    opening: ["Area between curves comes from thin vertical strips. At each x, a strip's height is upper y-value minus lower y-value; its width is dx. Integrate that nonnegative height across the interval. First find where the curves cross, since the upper curve may change there."],
    examples: [
      { question: "Find the area between y = x and y = x² on 0 ≤ x ≤ 1.", approach: "Test which graph is higher inside the interval.", steps: ["At x = 1/2, x = 1/2 while x² = 1/4, so x is above x².", "Area = ∫ from 0 to 1 of (x - x²)dx.", "An antiderivative is x²/2 - x³/3. Evaluate at 1 and 0: 1/2 - 1/3 = 1/6 square units."], check: "The integrand x - x² is nonnegative on [0, 1], so the area is positive." },
      { question: "Find the area between y = x² and y = 2 - x².", approach: "Solve for intersections before setting bounds.", steps: ["Set x² = 2 - x², so 2x² = 2 and x = ±1.", "Between -1 and 1, 2 - x² is above x²; at x = 0 the heights are 2 and 0.", "Area = ∫ from -1 to 1 of (2 - 2x²)dx = [2x - (2/3)x³] from -1 to 1 = 8/3."], check: "The region is symmetric; twice the 0-to-1 integral gives the same 8/3." },
    ], practice: [
      { question: "Find the area between y = 4 and y = x² from x = -2 to 2.", hint: "Top minus bottom is 4 - x².", solution: ["Area = ∫ from -2 to 2 of (4 - x²)dx.", "By symmetry, 2[4x - x³/3] from 0 to 2 = 2(8 - 8/3) = 32/3."] },
      { question: "Why can integrating f - g over an interval give the wrong geometric area?", hint: "What if f and g swap which one is above?", solution: ["When the curves cross, f - g changes sign and positive and negative contributions can cancel.", "Split at each crossing, or integrate |f - g|, so every strip has nonnegative height."] },
    ], takeaway: "Solve intersections, identify the top curve on each interval, then integrate top minus bottom.",
  },
  "math.m7.l2": {
    opening: ["Volume by slicing repeats the area idea in three dimensions. A thin slice at x has cross-sectional area A(x) and thickness dx, so volume is ∫A(x)dx. For a solid formed by rotating a region around an axis, a slice may become a disk with area πr(x)².", "The radius is a distance to the axis, not automatically the original y-value. Draw one representative slice and label its radius before integrating."],
    examples: [
      { question: "Rotate the region under y = x on [0, 2] about the x-axis. Find volume.", approach: "A vertical slice becomes a disk of radius x.", steps: ["At position x, radius r(x) = x, so disk area A(x) = πx².", "Volume = ∫ from 0 to 2 of πx² dx = π[x³/3] from 0 to 2 = 8π/3 cubic units."], check: "The resulting solid is a cone of height 2 and base radius 2; its geometric volume is (1/3)π(2²)(2) = 8π/3." },
      { question: "A solid has square cross sections perpendicular to x, with side length s(x) = 1 + x on 0 ≤ x ≤ 1. Find volume.", approach: "Use cross-sectional area; no rotation is involved.", steps: ["Each slice is a square, so A(x) = s(x)² = (1 + x)².", "Volume = ∫ from 0 to 1 of (1 + 2x + x²)dx.", "Evaluate [x + x² + x³/3] from 0 to 1 = 1 + 1 + 1/3 = 7/3 cubic units."], check: "Slice areas grow from 1 to 4, so a volume between 1 and 4 over unit length is plausible." },
    ], practice: [
      { question: "Rotate the region under y = √x on 0 ≤ x ≤ 4 about the x-axis. Find volume.", hint: "Disk area is π(√x)² = πx.", solution: ["V = ∫ from 0 to 4 of πx dx = π[x²/2] from 0 to 4.", "V = 8π cubic units."] },
      { question: "If triangular cross sections have base x and height 2x on [0, 1], find volume.", hint: "Area of each triangle is (1/2)·base·height.", solution: ["A(x) = (1/2)(x)(2x) = x².", "V = ∫ from 0 to 1 of x² dx = 1/3 cubic unit."] },
    ], takeaway: "Volume is accumulated cross-sectional area. Label the slice and its dimensions before writing the integral.",
  },
  "math.m7.l3": {
    opening: ["A washer is a disk with a circular hole: area π(R² - r²), where R is the outer radius and r the inner radius. A shell is a thin cylindrical wall: volume about 2π(radius)(height)(thickness). Choose a method based on how a slice meets the axis of rotation.", "For washers, slices perpendicular to the axis often work best. For shells, slices parallel to the axis can avoid solving functions for the other variable. In both cases, radius means distance to the axis."],
    examples: [
      { question: "Rotate the region between y = 2 and y = x on 0 ≤ x ≤ 2 about the x-axis.", approach: "A vertical slice gives a washer with outer radius 2 and inner radius x.", steps: ["Washer area A(x) = π(2² - x²) = π(4 - x²).", "Volume = π∫ from 0 to 2 of (4 - x²)dx.", "Evaluate π[4x - x³/3] from 0 to 2 = π(8 - 8/3) = 16π/3."], check: "Subtracting the inner disk is necessary; rotating the whole region under y = 2 alone would overcount." },
      { question: "Rotate the region under y = x on [0, 2] about the y-axis using shells.", approach: "A vertical strip at x travels around the y-axis at radius x.", steps: ["The shell radius is x, height is x, and thickness is dx.", "Volume = ∫ from 0 to 2 of 2π(x)(x)dx = 2π∫ from 0 to 2 x²dx.", "Evaluate: 2π[x³/3] from 0 to 2 = 16π/3."], check: "At a fixed height y, the solid fills radii from y to 2: it is a radius-2 cylinder with a cone-shaped void. Cylinder volume 8π minus cone volume 8π/3 also gives 16π/3." },
    ], practice: [
      { question: "Rotate the region between y = 3 and y = 1 on 0 ≤ x ≤ 2 about the x-axis. Find volume.", hint: "Use constant outer radius 3 and inner radius 1.", solution: ["Washer area = π(9 - 1) = 8π.", "Over length 2, volume = ∫ from 0 to 2 of 8π dx = 16π."] },
      { question: "Rotate the region under y = 2 - x on [0, 2] about the y-axis using shells.", hint: "Radius x, height 2 - x.", solution: ["V = 2π∫ from 0 to 2 of x(2 - x)dx.", "V = 2π[x² - x³/3] from 0 to 2 = 2π(4 - 8/3) = 8π/3."] },
    ], takeaway: "Washers subtract inner circular area. Shells multiply circumference by height and thickness.",
  },
  "math.m7.l4": {
    opening: ["The average value of a continuous function on [a, b] is its total signed accumulation divided by interval length: (1/(b - a))∫ from a to b f(x)dx. This is the continuous version of sum of values divided by number of values.", "The same rate-times-time idea appears in physics: integrate density over length for mass, or velocity over time for displacement. Check units before and after dividing: an average has the original function's units, while an integral has function-units times input-units."],
    examples: [
      { question: "Find the average value of f(x) = x² on [0, 3].", approach: "Compute the integral, then divide by interval length 3.", steps: ["∫ from 0 to 3 of x² dx = [x³/3] from 0 to 3 = 27/3 = 9.", "Interval length is 3 - 0 = 3, so average value is 9/3 = 3."], check: "The function ranges from 0 to 9, so average 3 lies within that range." },
      { question: "A wire from x = 0 to 2 m has density ρ(x) = 1 + x kg/m. Find its mass.", approach: "A short piece has mass roughly density times length; integrate over the wire.", steps: ["Mass m = ∫ from 0 to 2 of (1 + x)dx.", "An antiderivative is x + x²/2. Evaluate at 2 and 0: 2 + 4/2 = 4 kg."], check: "Density rises from 1 to 3 kg/m, averaging 2 kg/m over 2 m, so 4 kg makes sense." },
    ], practice: [
      { question: "Find the average value of f(x) = 2x on [1, 3].", hint: "First integrate, then divide by width 2.", solution: ["∫ from 1 to 3 of 2x dx = [x²] from 1 to 3 = 9 - 1 = 8.", "Divide by 3 - 1 = 2, giving average value 4."] },
      { question: "A rod of length 3 m has constant density 5 kg/m. Find its mass.", hint: "Integrate constant density over length.", solution: ["Mass = ∫ from 0 to 3 of 5 dx = 5·3 = 15 kg."] },
    ], takeaway: "Integrate to get a total; divide by interval length to get the function's average value.",
  },
  "math.m7.l5": {
    opening: ["Work is force applied through distance. A constant force F over displacement d does work W = Fd. When force changes with position, each tiny displacement dx contributes approximately F(x)dx, so total work is ∫F(x)dx.", "Force in newtons times distance in meters gives joules. Choose the integration bounds and direction carefully. A spring following Hooke's law needs more force the farther it is stretched, so using only the final force times the whole distance overestimates the work."],
    examples: [
      { question: "A spring requires F(x) = 100x newtons when stretched x meters. Find work to stretch it from 0 to 0.2 m.", approach: "Integrate the changing force over the displacement.", steps: ["W = ∫ from 0 to 0.2 of 100x dx.", "An antiderivative is 50x². Evaluate: 50(0.2)² - 0 = 50(0.04) = 2 joules."], check: "Final force is 20 N, but 20 N × 0.2 m = 4 J would assume that force acted throughout; actual work is 2 J." },
      { question: "A variable force F(x) = 3x² N acts from x = 1 to x = 2 meters. Find work.", approach: "Use the actual start and end positions, not a 0-to-1 interval.", steps: ["W = ∫ from 1 to 2 of 3x² dx.", "An antiderivative is x³. Evaluate at 2 minus 1: 8 - 1 = 7 joules."], check: "Force rises from 3 N to 12 N, so work over 1 m should lie between 3 and 12 J; 7 J does." },
    ], practice: [
      { question: "Find work to stretch a spring with F(x) = 50x N from x = 0 to x = 0.4 m.", hint: "Integrate 50x, not the final force alone.", solution: ["W = ∫ from 0 to 0.4 of 50x dx = [25x²] from 0 to 0.4.", "W = 25(0.16) = 4 J."] },
      { question: "Why is ∫F(x)dx measured in joules when F uses newtons and x uses meters?", hint: "Multiply the units in force × displacement.", solution: ["Each small contribution F(x)dx has units N·m.", "One newton-meter of mechanical work is one joule, so the total is in joules."] },
    ], takeaway: "Integrate position-dependent force over displacement. Final force times total distance is usually not the same thing.",
  },
  "math.m7.l6": {
    opening: ["Applications become easier when you identify the small piece being accumulated. For area, it is a strip with height × width. For volume, it is cross-sectional area × thickness. For mass, density × length. For work, force × displacement.", "Write the units of that small piece before integrating. Then choose bounds that match the physical region, split when an expression changes sign or the geometry changes, and interpret the final number in the original setting."],
    examples: [
      { question: "A tank receives water at r(t) = 2t + 1 liters/minute from t = 0 to t = 3 minutes. How much enters?", approach: "Rate × time is a small volume; integrate over the stated time.", steps: ["Total volume = ∫ from 0 to 3 of (2t + 1)dt.", "An antiderivative is t² + t. Evaluate: (9 + 3) - 0 = 12 liters."], check: "The rate grows from 1 to 7 L/min, averaging 4 L/min over 3 minutes, which also gives 12 L." },
      { question: "A wire of length 2 m has density ρ(x) = x² + 1 kg/m. Find total mass.", approach: "Density varies with position, so integrate it rather than multiplying one sample density by length.", steps: ["Mass = ∫ from 0 to 2 of (x² + 1)dx.", "An antiderivative is x³/3 + x. Evaluate: 8/3 + 2 = 14/3 kg."], check: "Average density is (14/3)/2 = 7/3 kg/m, between its endpoint densities 1 and 5." },
    ], practice: [
      { question: "A force F(x) = 4x N moves an object from x = 1 m to x = 3 m. Find work.", hint: "Force × dx has units joules.", solution: ["W = ∫ from 1 to 3 of 4x dx = [2x²] from 1 to 3.", "W = 18 - 2 = 16 J."] },
      { question: "A solid has square cross sections of side x on [0, 2]. Find its volume.", hint: "Cross-sectional area is x².", solution: ["V = ∫ from 0 to 2 of x² dx = [x³/3] from 0 to 2.", "V = 8/3 cubic units."] },
    ], takeaway: "Name the tiny contribution and its units first; the correct integral then follows from adding those contributions.",
  },
};
