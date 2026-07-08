import React, { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "./supabaseClient";
import Papa from "papaparse";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from "recharts";
import {
  LayoutDashboard, Users, PlusCircle, FileText, ChevronRight, ChevronDown, ChevronUp,
  Printer, Save, Trash2, X, TrendingUp, TrendingDown, Minus, Loader2, RotateCcw, GripVertical, Trophy, Award
} from "lucide-react";

/* ======================== SEED DATA ======================== */

const PANTHERS_LOGO = "data:image/png;base64,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";

const ROSTER_SEED = [
  { jersey: "#5", name: "Kevin Puddephatt" },
  { jersey: "#6", name: "Ethan Deitner" },
  { jersey: "#7", name: "Ryker Falconer" },
  { jersey: "#10", name: "Carter Mielke" },
  { jersey: "#11", name: "Riley James" },
  { jersey: "#17", name: "Declan Kopysh" },
  { jersey: "#22", name: "Leo Hoover" },
  { jersey: "#25", name: "Lawson Buck" },
  { jersey: "#28", name: "Eli Herman" },
  { jersey: "#46", name: "Samuel Lannan" },
  { jersey: "#98", name: "Jacob Lannan" },
  { jersey: "#99", name: "Henri Raymond" },
];

const SEED_GAMES = [{"gameNum":1,"date":"May 11, 2026","opponent":"vs Cambridge 1","players":{"Kevin Puddephatt":{"jersey":"#5","positions":["RC","RC","2B","2B","SIT",null,null]},"Ethan Deitner":{"jersey":"#6","positions":["SIT","LF","LF","LF","P",null,null]},"Ryker Falconer":{"jersey":"#7","positions":["3B","3B","RF","RF","3B",null,null]},"Carter Mielke":{"jersey":"#10","positions":["LC","LC","SS","SS","SIT",null,null]},"Riley James":{"jersey":"#11","positions":["1B","1B","1B","SIT","RC",null,null]},"Declan Kopysh":{"jersey":"#17","positions":["SIT","RF","C","C","1B",null,null]},"Leo Hoover":{"jersey":"#22","positions":["RF","SIT","P","P","LF",null,null]},"Lawson Buck":{"jersey":"#25","positions":["P","P","SIT","1B","RF",null,null]},"Eli Herman":{"jersey":"#28","positions":["SS","SS","SIT","LC","SS",null,null]},"Samuel Lannan":{"jersey":"#46","positions":["C","C","LC","SIT","LC",null,null]},"Jacob Lannan":{"jersey":"#98","positions":["LF","SIT","3B","3B","C",null,null]},"Henri Raymond":{"jersey":"#99","positions":["2B","2B","RC","RC","2B",null,null]}}},{"gameNum":2,"date":"May 18, 2026","opponent":"at Brantford","players":{"Kevin Puddephatt":{"jersey":"#5","positions":["2B","2B","SIT","RF","RC","2B",null]},"Ethan Deitner":{"jersey":"#6","positions":["RF","P","2B","SIT","2B","RF",null]},"Ryker Falconer":{"jersey":"#7","positions":["3B","RC","1B","1B","SIT","LF",null]},"Carter Mielke":{"jersey":"#10","positions":["SS","SS","SIT","LC","LC","SS",null]},"Riley James":{"jersey":"#11","positions":["1B","1B","RC","RC","1B","1B",null]},"Declan Kopysh":{"jersey":"#17","positions":["RC","SIT","P","2B","P","3B",null]},"Leo Hoover":{"jersey":"#22","positions":["P","SIT","LC","SIT","LF","P",null]},"Lawson Buck":{"jersey":"#25","positions":["LF","LF","C","P","3B","C",null]},"Eli Herman":{"jersey":"#28","positions":["LC","LC","SS","SS","SS","SIT",null]},"Samuel Lannan":{"jersey":"#46","positions":["SIT","RF","RF","C","C","RC",null]},"Jacob Lannan":{"jersey":"#98","positions":["C","C","LF","LF","RF","SIT",null]},"Henri Raymond":{"jersey":"#99","positions":["SIT","3B","3B","3B","SIT","LC",null]}}},{"gameNum":3,"date":"May 20, 2026","opponent":"at Hamilton","players":{"Kevin Puddephatt":{"jersey":"#5","positions":["3B","SIT","LF","2B","2B",null,null]},"Ethan Deitner":{"jersey":"#6","positions":["RF","RF","SIT","P","P",null,null]},"Ryker Falconer":{"jersey":"#7","positions":["LC","LF","3B","3B","SIT",null,null]},"Carter Mielke":{"jersey":"#10","positions":["SIT","LC","LC","SS","SS",null,null]},"Riley James":{"jersey":"#11","positions":["SIT","RC","RC","1B","1B",null,null]},"Declan Kopysh":{"jersey":"#17","positions":["P","3B","2B","RC","SIT",null,null]},"Leo Hoover":{"jersey":"#22","positions":["1B","1B","RF","RF","RF",null,null]},"Lawson Buck":{"jersey":"#25","positions":["RC","P","P","LF","LF",null,null]},"Eli Herman":{"jersey":"#28","positions":["SS","SS","SS","SIT","LC",null,null]},"Samuel Lannan":{"jersey":"#46","positions":["C","C","SIT","LC","C",null,null]},"Jacob Lannan":{"jersey":"#98","positions":["LF","SIT","C","C","RC",null,null]},"Henri Raymond":{"jersey":"#99","positions":["2B","2B","1B","SIT","3B",null,null]}}},{"gameNum":4,"date":"May 25, 2026","opponent":"vs Waterloo #1","players":{"Kevin Puddephatt":{"jersey":"#5","positions":["RC","SIT","2B","2B","C",null,null]},"Ethan Deitner":{"jersey":"#6","positions":["3B","P","SIT","3B","LF",null,null]},"Ryker Falconer":{"jersey":"#7","positions":["P","RF","1B","SIT","3B",null,null]},"Carter Mielke":{"jersey":"#10","positions":["SIT","LC","SS","SS","SS",null,null]},"Riley James":{"jersey":"#11","positions":["1B","1B","SIT","RC","1B",null,null]},"Declan Kopysh":{"jersey":"#17","positions":["LC","3B","3B","LF","LC",null,null]},"Leo Hoover":{"jersey":"#22","positions":["RF","RC","LF","1B","P",null,null]},"Lawson Buck":{"jersey":"#25","positions":["LF","SIT","P","P","SIT",null,null]},"Eli Herman":{"jersey":"#28","positions":["SS","SS","LC","LC","SIT",null,null]},"Samuel Lannan":{"jersey":"#46","positions":["C","C","RF","SIT","RF",null,null]},"Jacob Lannan":{"jersey":"#98","positions":["SIT","LF","C","C","RC",null,null]},"Henri Raymond":{"jersey":"#99","positions":["2B","2B","RC","RF","2B",null,null]}}},{"gameNum":5,"date":"May 26, 2026","opponent":"at Waterloo #2","players":{"Kevin Puddephatt":{"jersey":"#5","positions":["RC","2B","2B","C","C",null,null]},"Ethan Deitner":{"jersey":"#6","positions":["3B","P","RF","2B","LF",null,null]},"Ryker Falconer":{"jersey":"#7","positions":["P","RF","1B","3B","3B",null,null]},"Carter Mielke":{"jersey":"#10","positions":["SIT","LC","SS","SS","SS",null,null]},"Riley James":{"jersey":"#11","positions":["1B","1B","SIT","RC","1B",null,null]},"Declan Kopysh":{"jersey":"#17","positions":["LC","3B","3B","LF","LC",null,null]},"Leo Hoover":{"jersey":"#22","positions":["RF","RC","LF","1B","P",null,null]},"Lawson Buck":{"jersey":"#25","positions":["LF","LF","P","P","RC",null,null]},"Eli Herman":{"jersey":"#28","positions":["SS","SS","LC","LC","SIT",null,null]},"Samuel Lannan":{"jersey":"#46","positions":["C","C","C","SIT","RF",null,null]},"Jacob Lannan":{"jersey":"#98","positions":[null,null,null,null,null,null,null]},"Henri Raymond":{"jersey":"#99","positions":["2B","SIT","RC","RF","2B",null,null]}}},{"gameNum":6,"date":"May 30, 2026","opponent":"at Cambridge 1","players":{"Kevin Puddephatt":{"jersey":"#5","positions":["2B","2B","RF","RF",null,null,null]},"Ethan Deitner":{"jersey":"#6","positions":["RF","P","3B","LF",null,null,null]},"Ryker Falconer":{"jersey":"#7","positions":["3B","RC","C","1B",null,null,null]},"Carter Mielke":{"jersey":"#10","positions":["SS","SS","RC","LC",null,null,null]},"Riley James":{"jersey":"#11","positions":[null,null,null,null,null,null,null]},"Declan Kopysh":{"jersey":"#17","positions":["RC","RF","1B","3B",null,null,null]},"Leo Hoover":{"jersey":"#22","positions":["P","1B","LC","RC",null,null,null]},"Lawson Buck":{"jersey":"#25","positions":["LF","LF","P","P",null,null,null]},"Eli Herman":{"jersey":"#28","positions":["LC","LC","SS","SS",null,null,null]},"Samuel Lannan":{"jersey":"#46","positions":[null,null,null,null,null,null,null]},"Jacob Lannan":{"jersey":"#98","positions":["C","C","LF","C",null,null,null]},"Henri Raymond":{"jersey":"#99","positions":["1B","3B","2B","2B",null,null,null]}}},{"gameNum":7,"date":"May 31, 2026","opponent":"at Guelph Black","players":{"Kevin Puddephatt":{"jersey":"#5","positions":["2B","2B","RC","RC","2B",null,null]},"Ethan Deitner":{"jersey":"#6","positions":["P","3B","P","LF","P",null,null]},"Ryker Falconer":{"jersey":"#7","positions":["C","LF","C","LC","3B",null,null]},"Carter Mielke":{"jersey":"#10","positions":["SS","SS","LC","SIT","SS",null,null]},"Riley James":{"jersey":"#11","positions":["1B","1B","RF","RF","1B",null,null]},"Declan Kopysh":{"jersey":"#17","positions":["RC","RC","2B","2B","LF",null,null]},"Leo Hoover":{"jersey":"#22","positions":["RF","RF","1B","1B","RF",null,null]},"Lawson Buck":{"jersey":"#25","positions":["3B","P","LF","P","SIT",null,null]},"Eli Herman":{"jersey":"#28","positions":["LC","LC","SS","SS","LC",null,null]},"Samuel Lannan":{"jersey":"#46","positions":[null,null,null,null,null,null,null]},"Jacob Lannan":{"jersey":"#98","positions":["LF","C","SIT","C","C",null,null]},"Henri Raymond":{"jersey":"#99","positions":["SIT","SIT","3B","3B","RC",null,null]}}},{"gameNum":8,"date":"June 1, 2026","opponent":"vs Guelph Black","players":{"Kevin Puddephatt":{"jersey":"#5","positions":["RC","RC","2B","RC","C","2B",null]},"Ethan Deitner":{"jersey":"#6","positions":["P","LF","P","3B","RF","P",null]},"Ryker Falconer":{"jersey":"#7","positions":["C","LC","3B","C","P","C",null]},"Carter Mielke":{"jersey":"#10","positions":["LC","SIT","SS","LC","RC","SS",null]},"Riley James":{"jersey":"#11","positions":["RF","RF","1B","1B","SIT","1B",null]},"Declan Kopysh":{"jersey":"#17","positions":["2B","2B","LF","2B","2B","RC",null]},"Leo Hoover":{"jersey":"#22","positions":["1B","1B","RC","SIT","1B","RF",null]},"Lawson Buck":{"jersey":"#25","positions":["LF","P","RF","LF","LF","SIT",null]},"Eli Herman":{"jersey":"#28","positions":["SS","SS","LC","SS","SS","LC",null]},"Samuel Lannan":{"jersey":"#46","positions":[null,null,null,null,null,null,null]},"Jacob Lannan":{"jersey":"#98","positions":["SIT","C","C","P","LC","LF",null]},"Henri Raymond":{"jersey":"#99","positions":["3B","3B","SIT","RF","3B","3B",null]}}},{"gameNum":9,"date":"June 6, 2026","opponent":"at Woodstock","players":{"Kevin Puddephatt":{"jersey":"#5","positions":[null,null,null,null,null,null,null]},"Ethan Deitner":{"jersey":"#6","positions":["SIT","P","3B","3B","LC",null,null]},"Ryker Falconer":{"jersey":"#7","positions":["3B","LC","P","SIT","2B",null,null]},"Carter Mielke":{"jersey":"#10","positions":["SS","2B","LC","LC","C",null,null]},"Riley James":{"jersey":"#11","positions":["LF","LF","1B","1B","SIT",null,null]},"Declan Kopysh":{"jersey":"#17","positions":["2B","RC","2B","2B","RC",null,null]},"Leo Hoover":{"jersey":"#22","positions":["1B","1B","RC","RC","1B",null,null]},"Lawson Buck":{"jersey":"#25","positions":["P","SIT","LF","P","LF",null,null]},"Eli Herman":{"jersey":"#28","positions":["LC","SS","SS","SS","SS",null,null]},"Samuel Lannan":{"jersey":"#46","positions":["C","C","SIT","RF","RF",null,null]},"Jacob Lannan":{"jersey":"#98","positions":["RF","RF","C","C","P",null,null]},"Henri Raymond":{"jersey":"#99","positions":["RC","3B","RF","LF","3B",null,null]}}},{"gameNum":10,"date":"June 7, 2026 (G1)","opponent":"at Guelph Black","players":{"Kevin Puddephatt":{"jersey":"#5","positions":["2B","2B","2B","SIT","2B","2B","2B"]},"Ethan Deitner":{"jersey":"#6","positions":["P","SIT","P","P","LF","P","P"]},"Ryker Falconer":{"jersey":"#7","positions":["LC","LC","LC","2B","LC","LC","LC"]},"Carter Mielke":{"jersey":"#10","positions":[null,null,null,null,null,null,null]},"Riley James":{"jersey":"#11","positions":["1B","1B","1B","1B","1B","1B","1B"]},"Declan Kopysh":{"jersey":"#17","positions":["RF","RF","RF","RF","RF","SIT","SIT"]},"Leo Hoover":{"jersey":"#22","positions":["RC","RC","RC","RC","RC","RC","RC"]},"Lawson Buck":{"jersey":"#25","positions":["SIT","P","LF","LC","P","LF","LF"]},"Eli Herman":{"jersey":"#28","positions":["SS","SS","SS","SS","SS","SS","SS"]},"Samuel Lannan":{"jersey":"#46","positions":["C","C","C","C","SIT","C","C"]},"Jacob Lannan":{"jersey":"#98","positions":["LF","LF","SIT","LF","C","RF","RF"]},"Henri Raymond":{"jersey":"#99","positions":["3B","3B","3B","3B","3B","3B","3B"]}}},{"gameNum":11,"date":"June 7, 2026 (G2)","opponent":"at Guelph Black","players":{"Kevin Puddephatt":{"jersey":"#5","positions":["RC","RC","RC",null,null,null,null]},"Ethan Deitner":{"jersey":"#6","positions":["3B","3B","3B",null,null,null,null]},"Ryker Falconer":{"jersey":"#7","positions":["SS","SS","SS",null,null,null,null]},"Carter Mielke":{"jersey":"#10","positions":[null,null,null,null,null,null,null]},"Riley James":{"jersey":"#11","positions":["RC","RF","1B",null,null,null,null]},"Declan Kopysh":{"jersey":"#17","positions":["SIT","2B","2B",null,null,null,null]},"Leo Hoover":{"jersey":"#22","positions":["1B","1B","SIT",null,null,null,null]},"Lawson Buck":{"jersey":"#25","positions":["P","P","P",null,null,null,null]},"Eli Herman":{"jersey":"#28","positions":["LC","LC","LC",null,null,null,null]},"Samuel Lannan":{"jersey":"#46","positions":["RF","RF","RF",null,null,null,null]},"Jacob Lannan":{"jersey":"#98","positions":["C","C","C",null,null,null,null]},"Henri Raymond":{"jersey":"#99","positions":["LF","SIT","LF",null,null,null,null]}}},{"gameNum":12,"date":"June 8, 2026","opponent":"vs Guelph Black","players":{"Kevin Puddephatt":{"jersey":"#5","positions":["SIT","2B","2B","C","C",null,null]},"Ethan Deitner":{"jersey":"#6","positions":["P","P","P","SIT","3B",null,null]},"Ryker Falconer":{"jersey":"#7","positions":["SIT","LC","RC","3B","2B",null,null]},"Carter Mielke":{"jersey":"#10","positions":["LC","SS","LC","SS","SS",null,null]},"Riley James":{"jersey":"#11","positions":["1B","1B","1B","RC","SIT",null,null]},"Declan Kopysh":{"jersey":"#17","positions":["2B","LF","LF","2B","SIT",null,null]},"Leo Hoover":{"jersey":"#22","positions":["RC","RC","SIT","1B","1B",null,null]},"Lawson Buck":{"jersey":"#25","positions":["LF","RF","SIT","P","P",null,null]},"Eli Herman":{"jersey":"#28","positions":["SS","SIT","SS","LC","LC",null,null]},"Samuel Lannan":{"jersey":"#46","positions":["C","SIT","C","RF","RF",null,null]},"Jacob Lannan":{"jersey":"#98","positions":["RF","C","RF","SIT","RC",null,null]},"Henri Raymond":{"jersey":"#99","positions":["3B","3B","3B","LF","LF",null,null]}}},{"gameNum":13,"date":"June 15, 2026","opponent":"vs Hamilton","players":{"Kevin Puddephatt":{"jersey":"#5","positions":["RC","RC","SIT","2B","2B","RC",null]},"Ethan Deitner":{"jersey":"#6","positions":["P","SIT","RF","P","3B","3B",null]},"Ryker Falconer":{"jersey":"#7","positions":["3B","3B","2B","RF","RC","SIT",null]},"Carter Mielke":{"jersey":"#10","positions":["SS","SS","SIT","LF","SS","LC",null]},"Riley James":{"jersey":"#11","positions":["SIT","RF","1B","1B","1B","RF",null]},"Declan Kopysh":{"jersey":"#17","positions":["2B","2B","RC","RC","SIT","2B",null]},"Leo Hoover":{"jersey":"#22","positions":["1B","1B","LC","LC","SIT","1B",null]},"Lawson Buck":{"jersey":"#25","positions":["LF","LF","P","SIT","P","P",null]},"Eli Herman":{"jersey":"#28","positions":["SIT","LC","SS","SS","LC","SS",null]},"Samuel Lannan":{"jersey":"#46","positions":["RF","P","C","C","RF","SIT",null]},"Jacob Lannan":{"jersey":"#98","positions":["C","C","LF","SIT","C","C",null]},"Henri Raymond":{"jersey":"#99","positions":["LC","SIT","3B","3B","LF","LF",null]}}},{"gameNum":14,"date":"June 23, 2026","opponent":"vs Woodstock","players":{"Kevin Puddephatt":{"jersey":"#5","positions":["2B","2B","RC","C","RC","RC",null]},"Ethan Deitner":{"jersey":"#6","positions":["P","3B","3B","P","P","SIT",null]},"Ryker Falconer":{"jersey":"#7","positions":["RF","RC","SIT","RC","3B","3B",null]},"Carter Mielke":{"jersey":"#10","positions":["LF","SS","LC","SIT","SS","SS",null]},"Riley James":{"jersey":"#11","positions":["1B","1B","RF","SIT","SIT","RF",null]},"Declan Kopysh":{"jersey":"#17","positions":["RC","SIT","2B","2B","2B","2B",null]},"Leo Hoover":{"jersey":"#22","positions":["LC","SIT","1B","1B","1B","1B",null]},"Lawson Buck":{"jersey":"#25","positions":["SIT","P","P","LF","LF","LF",null]},"Eli Herman":{"jersey":"#28","positions":["SS","LC","SS","SS","SIT","LC",null]},"Samuel Lannan":{"jersey":"#46","positions":["C","RF","SIT","RF","RF","P",null]},"Jacob Lannan":{"jersey":"#98","positions":["SIT","C","C","LC","C","C",null]},"Henri Raymond":{"jersey":"#99","positions":["3B","LF","LF","3B","LC","SIT",null]}}},{"gameNum":15,"date":"June 27, 2026","opponent":"vs Waterloo #2","players":{"Kevin Puddephatt":{"jersey":"#5","positions":["P","SIT","2B","2B","RC",null,null]},"Ethan Deitner":{"jersey":"#6","positions":["RF","RF","P","P","LF",null,null]},"Ryker Falconer":{"jersey":"#7","positions":["SIT","P","SS","RC","2B",null,null]},"Carter Mielke":{"jersey":"#10","positions":["3B","3B","LC","SS","LC",null,null]},"Riley James":{"jersey":"#11","positions":["RC","RC","RC","1B","1B",null,null]},"Declan Kopysh":{"jersey":"#17","positions":["2B","2B","LF","LF","SIT",null,null]},"Leo Hoover":{"jersey":"#22","positions":["1B","1B","1B","SIT","P",null,null]},"Lawson Buck":{"jersey":"#25","positions":[null,null,null,null,null,null,null]},"Eli Herman":{"jersey":"#28","positions":["SS","SS","SIT","LC","SS",null,null]},"Samuel Lannan":{"jersey":"#46","positions":["C","C","RF","RF","RF",null,null]},"Jacob Lannan":{"jersey":"#98","positions":["LF","LF","C","C","C",null,null]},"Henri Raymond":{"jersey":"#99","positions":["LC","LC","3B","3B","3B",null,null]}}},{"gameNum":16,"date":"June 29, 2026","opponent":"vs Stratford","players":{"Kevin Puddephatt":{"jersey":"#5","positions":["RC","SIT","2B","2B","2B","RC",null]},"Ethan Deitner":{"jersey":"#6","positions":["LF","LF","LC","P","LF","SIT",null]},"Ryker Falconer":{"jersey":"#7","positions":["LC","RC","1B","1B","SIT","LC",null]},"Carter Mielke":{"jersey":"#10","positions":["SS","SS","SIT","LC","SS","RF",null]},"Riley James":{"jersey":"#11","positions":["1B","1B","RC","RC","1B","1B",null]},"Declan Kopysh":{"jersey":"#17","positions":["2B","2B","3B","SIT","RC","2B",null]},"Leo Hoover":{"jersey":"#22","positions":[null,null,null,null,null,null,null]},"Lawson Buck":{"jersey":"#25","positions":["P","P","P","3B","P","LF",null]},"Eli Herman":{"jersey":"#28","positions":["SIT","LC","SS","SS","LC","SS",null]},"Samuel Lannan":{"jersey":"#46","positions":["C","C","RF","RF","C","C",null]},"Jacob Lannan":{"jersey":"#98","positions":["RF","RF","C","C","RF","P",null]},"Henri Raymond":{"jersey":"#99","positions":["3B","3B","LF","LF","3B","3B",null]}}},{"gameNum":17,"date":"July 6, 2026","opponent":"vs Cambridge 2","gameType":"Regular Season","players":{"Kevin Puddephatt":{"jersey":"#5","positions":["SIT","LC","LC","2B","2B",null,null]},"Ethan Deitner":{"jersey":"#6","positions":["3B","RF","3B","P","RC",null,null]},"Ryker Falconer":{"jersey":"#7","positions":["SIT","3B","SS","RF","SS",null,null]},"Carter Mielke":{"jersey":"#10","positions":["SS","SS","SIT","LC","LF",null,null]},"Riley James":{"jersey":"#11","positions":["RC","RC","RC","1B","SIT",null,null]},"Declan Kopysh":{"jersey":"#17","positions":["2B","2B","2B","RC","SIT",null,null]},"Leo Hoover":{"jersey":"#22","positions":["1B","1B","1B","SIT","1B",null,null]},"Lawson Buck":{"jersey":"#25","positions":["P","P","P","LF","P",null,null]},"Eli Herman":{"jersey":"#28","positions":["LC","SIT","LF","SS","LC",null,null]},"Samuel Lannan":{"jersey":"#46","positions":["C","C","C","SIT","RF",null,null]},"Jacob Lannan":{"jersey":"#98","positions":["LF","LF","SIT","C","C",null,null]},"Henri Raymond":{"jersey":"#99","positions":["RF","SIT","RF","3B","3B",null,null]}}}];

const SEED_BATTING = [{"jersey":"#28","name":"Eli Herman","GP":17,"AB":55,"H":42,"1B":36,"2B":5,"3B":1,"HR":0,"RBI":14,"R":29,"SO":0},{"jersey":"#11","name":"Riley James","GP":16,"AB":51,"H":35,"1B":25,"2B":9,"3B":1,"HR":0,"RBI":18,"R":19,"SO":0},{"jersey":"#5","name":"Kevin Puddephatt","GP":16,"AB":56,"H":37,"1B":35,"2B":2,"3B":0,"HR":0,"RBI":8,"R":24,"SO":8},{"jersey":"#10","name":"Carter Mielke","GP":15,"AB":45,"H":30,"1B":26,"2B":4,"3B":0,"HR":0,"RBI":9,"R":18,"SO":2},{"jersey":"#99","name":"Henri Raymond","GP":17,"AB":51,"H":34,"1B":32,"2B":2,"3B":0,"HR":0,"RBI":15,"R":19,"SO":1},{"jersey":"#17","name":"Declan Kopysh","GP":17,"AB":52,"H":33,"1B":26,"2B":7,"3B":0,"HR":0,"RBI":10,"R":17,"SO":3},{"jersey":"#25","name":"Lawson Buck","GP":16,"AB":40,"H":26,"1B":21,"2B":4,"3B":1,"HR":0,"RBI":8,"R":16,"SO":7},{"jersey":"#22","name":"Leo Hoover","GP":16,"AB":51,"H":31,"1B":26,"2B":5,"3B":0,"HR":0,"RBI":12,"R":20,"SO":3},{"jersey":"#46","name":"Samuel Lannan","GP":14,"AB":40,"H":25,"1B":25,"2B":0,"3B":0,"HR":0,"RBI":11,"R":8,"SO":3},{"jersey":"#98","name":"Jacob Lannan","GP":16,"AB":44,"H":21,"1B":14,"2B":7,"3B":0,"HR":0,"RBI":14,"R":7,"SO":11},{"jersey":"#7","name":"Ryker Falconer","GP":17,"AB":52,"H":25,"1B":22,"2B":2,"3B":1,"HR":0,"RBI":10,"R":17,"SO":8},{"jersey":"#6","name":"Ethan Deitner","GP":17,"AB":49,"H":19,"1B":18,"2B":1,"3B":0,"HR":0,"RBI":4,"R":11,"SO":22}];

/* ======================== CONSTANTS ======================== */

const INFIELD = ["P", "C", "1B", "2B", "3B", "SS"];
const OUTFIELD = ["LF", "LC", "RC", "RF"];
const ALL_POS = [...INFIELD, ...OUTFIELD];
const POS_LABELS = { P:"Pitcher", C:"Catcher", "1B":"First Base", "2B":"Second Base", "3B":"Third Base", SS:"Shortstop", LF:"Left Field", LC:"Left Center", RC:"Right Center", RF:"Right Field", SIT:"Bench" };

const BLUE = "#5F8DB5";
const BLUE_DK = "#3E6284";

const NAVY = "#000000";
const NAVY_DEEP = "#000000";
const GOLD = BLUE;
const FIELD_GREEN = "#1A1A1A";
const FIELD_GREEN_LT = "#404040";
const INF_BLUE = BLUE;
const INF_BLUE_LT = "#8AACC7";
const SIT_GRAY = "#B8BCC0";
const PAPER = "#FFFFFF";
const INK = "#000000";
const RED = "#000000";
const AMBER = BLUE_DK;
const GREENOK = BLUE;

const POS_COLOR = {
  P: "#000000", C: "#262626", "1B": "#404040", "2B": "#595959", "3B": "#737373", SS: "#8C8C8C",
  LF: "#5F8DB5", LC: "#4A7196", RC: "#3A5A78", RF: "#2C4459",
  SIT: SIT_GRAY,
};

function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }
function classify(pos) {
  if (INFIELD.includes(pos)) return "IF";
  if (OUTFIELD.includes(pos)) return "OF";
  if (pos === "SIT") return "SIT";
  return null;
}

/* ======================== COMPUTATION ======================== */

function computeFielding(games, roster) {
  const result = {};
  roster.forEach((p) => {
    result[p.name] = { jersey: p.jersey, name: p.name, posCounts: {}, of: 0, if: 0, sit: 0, total: 0, gamesPlayed: 0 };
  });
  games.forEach((g) => {
    roster.forEach((p) => {
      const entry = g.players && g.players[p.name];
      const posArr = (entry && entry.positions) || [];
      const played = posArr.some((v) => !!v);
      const r = result[p.name];
      if (played) r.gamesPlayed += 1;
      posArr.forEach((pos) => {
        if (!pos) return;
        r.posCounts[pos] = (r.posCounts[pos] || 0) + 1;
        r.total += 1;
        const cls = classify(pos);
        if (cls === "IF") r.if += 1;
        else if (cls === "OF") r.of += 1;
        else if (cls === "SIT") r.sit += 1;
      });
    });
  });
  const balances = Object.values(result).map((r) => r.if - r.of);
  const meanBalance = balances.length ? balances.reduce((a, b) => a + b, 0) / balances.length : 0;
  Object.values(result).forEach((r) => {
    r.balance = r.if - r.of;
    const fieldTotal = r.of + r.if;
    r.ofPct = fieldTotal ? r.of / fieldTotal : 0;
    r.ifPct = fieldTotal ? r.if / fieldTotal : 0;
    r.sitPct = r.total ? r.sit / r.total : 0;
    r.deviation = r.balance - meanBalance;
    const g = gcd(r.of || 1, r.if || 1);
    r.ratio = `${Math.round(r.of / g)}:${Math.round(r.if / g)}`;
  });
  return { rows: result, meanBalance };
}

function computeBatting(raw) {
  return raw.map((p) => {
    const AB = Number(p.AB) || 0;
    const H = Number(p.H) || 0;
    const s1 = Number(p["1B"]) || 0;
    const s2 = Number(p["2B"]) || 0;
    const s3 = Number(p["3B"]) || 0;
    const hr = Number(p.HR) || 0;
    const TB = s1 + s2 * 2 + s3 * 3 + hr * 4;
    const AVG = AB ? H / AB : 0;
    const OBP = AB ? H / AB : 0;
    const SLG = AB ? TB / AB : 0;
    const OPS = OBP + SLG;
    return { ...p, AVG, OBP, SLG, OPS };
  });
}

function fmtAvg(n) {
  if (!isFinite(n)) return ".000";
  const s = n.toFixed(3);
  return n < 1 ? s.replace(/^0/, "") : s;
}

function balanceColor(dev) {
  const a = Math.abs(dev);
  if (a <= 3) return BLUE;
  if (a <= 6) return BLUE_DK;
  return "#000000";
}

function emptyGame(nextNum, roster) {
  const players = {};
  roster.forEach((p) => { players[p.name] = { jersey: p.jersey, positions: [null, null, null, null, null, null, null], absent: false }; });
  return { gameNum: nextNum, date: "", opponent: "", gameType: "Regular Season", players };
}

const GAME_TYPES = ["Regular Season", "Exhibition", "Tournament", "Playoff"];
const GAME_TYPE_COLOR = { "Regular Season": BLUE, Exhibition: "#595959", Tournament: "#000000", Playoff: "#000000" };

function blankBattingRow(player) {
  return { jersey: player.jersey, name: player.name, GP: 0, AB: 0, H: 0, "1B": 0, "2B": 0, "3B": 0, HR: 0, RBI: 0, R: 0, SO: 0, FC: 0 };
}

function parseGameChangerCSV(text) {
  const parsed = Papa.parse(text, { skipEmptyLines: true });
  const rows = parsed.data;
  if (!rows || rows.length < 3) return { error: "Couldn't read that file — is it a GameChanger stats export?" };
  const header = rows[1];
  const gpIndices = header.map((h, i) => (h && h.trim() === "GP" ? i : -1)).filter((i) => i >= 0);
  if (gpIndices.length === 0) return { error: "Couldn't find the batting columns in that file." };
  const battingEnd = gpIndices.length > 1 ? gpIndices[1] : header.length;
  const slice = header.slice(0, battingEnd);
  function findCol(name) {
    const idx = slice.findIndex((h) => h && h.trim().toUpperCase() === name.toUpperCase());
    return idx;
  }
  const idx = {
    number: findCol("Number"), gp: findCol("GP"), ab: findCol("AB"), h: findCol("H"),
    b1: findCol("1B"), b2: findCol("2B"), b3: findCol("3B"), hr: findCol("HR"),
    rbi: findCol("RBI"), r: findCol("R"), so: findCol("SO"), fc: findCol("FC"),
  };
  if (idx.number === -1 || idx.ab === -1 || idx.h === -1) return { error: "That file doesn't look like a GameChanger batting export." };
  const results = [];
  for (let i = 2; i < rows.length; i++) {
    const row = rows[i];
    if (!row || !row[idx.number] || String(row[idx.number]).trim() === "" || String(row[0]).trim() === "Totals") continue;
    const jersey = "#" + String(row[idx.number]).trim();
    results.push({
      jersey,
      GP: Number(row[idx.gp]) || 0, AB: Number(row[idx.ab]) || 0, H: Number(row[idx.h]) || 0,
      "1B": Number(row[idx.b1]) || 0, "2B": Number(row[idx.b2]) || 0, "3B": Number(row[idx.b3]) || 0,
      HR: Number(row[idx.hr]) || 0, RBI: Number(row[idx.rbi]) || 0, R: Number(row[idx.r]) || 0,
      SO: Number(row[idx.so]) || 0, FC: idx.fc >= 0 ? (Number(row[idx.fc]) || 0) : 0,
    });
  }
  if (results.length === 0) return { error: "No player rows found in that file." };
  return { results };
}



const BAT_FIELDS = { GP: "gp", AB: "ab", H: "h", "1B": "b1", "2B": "b2", "3B": "b3", HR: "hr", RBI: "rbi", R: "r", SO: "so", FC: "fc" };

function battingRowFromDb(row) {
  const out = { jersey: row.jersey, name: row.player_name };
  Object.entries(BAT_FIELDS).forEach(([jsKey, dbKey]) => { out[jsKey] = row[dbKey] || 0; });
  return out;
}
function battingRowToDb(row) {
  const out = { player_name: row.name, jersey: row.jersey };
  Object.entries(BAT_FIELDS).forEach(([jsKey, dbKey]) => { out[dbKey] = Number(row[jsKey]) || 0; });
  return out;
}

async function loadData() {
  const [gamesRes, battingRes, playersRes, mvpRes] = await Promise.all([
    supabase.from("games").select("*").order("game_num", { ascending: true }),
    supabase.from("batting_stats").select("*"),
    supabase.from("players").select("*").order("sort_order", { ascending: true }),
    supabase.from("mvp_awards").select("*").order("awarded_at", { ascending: true }),
  ]);

  const games = (gamesRes.data || []).map((g) => ({
    gameNum: g.game_num, date: g.date || "", opponent: g.opponent || "", gameType: g.game_type || "Regular Season", players: g.players || {},
  }));
  const batting = (battingRes.data || []).map(battingRowFromDb);
  const roster = (playersRes.data || []).map((p) => ({ id: p.id, jersey: p.jersey, name: p.name, photoUrl: p.photo_url || null }));
  const mvpAwards = (mvpRes.data || []).map((a) => ({
    id: a.id, name: a.player_name, context: a.context, gameNum: a.game_num,
    practiceDate: a.practice_date, gameLabel: a.game_label, awardedAt: a.awarded_at,
  }));

  return { games, batting, roster, mvpAwards };
}

async function saveGames(games) {
  try {
    const rows = games.map((g) => ({ game_num: g.gameNum, date: g.date, opponent: g.opponent, game_type: g.gameType || "Regular Season", players: g.players }));
    const { error } = await supabase.from("games").upsert(rows, { onConflict: "game_num" });
    if (error) throw error;
    return true;
  } catch (e) { console.error(e); return false; }
}

async function deleteGameRow(gameNum) {
  try {
    const { error } = await supabase.from("games").delete().eq("game_num", gameNum);
    if (error) throw error;
    return true;
  } catch (e) { console.error(e); return false; }
}

async function saveBatting(batting) {
  try {
    const rows = batting.map(battingRowToDb);
    const { error } = await supabase.from("batting_stats").upsert(rows, { onConflict: "player_name" });
    if (error) throw error;
    return true;
  } catch (e) { console.error(e); return false; }
}

async function saveRosterOrder(roster) {
  try {
    const updates = roster.map((p, i) => supabase.from("players").update({ sort_order: i }).eq("id", p.id));
    await Promise.all(updates);
    return true;
  } catch (e) { console.error(e); return false; }
}

async function addPlayerRow(player, sortOrder) {
  try {
    const { data, error } = await supabase.from("players").insert({ jersey: player.jersey, name: player.name, sort_order: sortOrder }).select().single();
    if (error) throw error;
    return { id: data.id, jersey: data.jersey, name: data.name, photoUrl: data.photo_url || null };
  } catch (e) { console.error(e); return null; }
}

async function uploadPlayerPhoto(playerId, file) {
  try {
    const ext = file.name.split(".").pop();
    const path = `${playerId}-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("player-photos").upload(path, file, { upsert: true });
    if (upErr) throw upErr;
    const { data } = supabase.storage.from("player-photos").getPublicUrl(path);
    const photoUrl = data.publicUrl;
    const { error: dbErr } = await supabase.from("players").update({ photo_url: photoUrl }).eq("id", playerId);
    if (dbErr) throw dbErr;
    return { url: photoUrl };
  } catch (e) { console.error(e); return { error: (e && e.message) || String(e) }; }
}

async function saveMvpAward(award) {
  try {
    const { error } = await supabase.from("mvp_awards").insert({
      player_name: award.name, context: award.context, game_num: award.gameNum,
      practice_date: award.practiceDate || null, game_label: award.gameLabel, awarded_at: award.awardedAt,
    });
    if (error) throw error;
    return true;
  } catch (e) { console.error(e); return false; }
}

async function deleteMvpAward(id) {
  try {
    const { error } = await supabase.from("mvp_awards").delete().eq("id", id);
    if (error) throw error;
    return true;
  } catch (e) { console.error(e); return false; }
}


/* ======================== SMALL UI PIECES ======================== */

function PlayerAvatar({ player, size }) {
  if (player.photoUrl) {
    return <img src={player.photoUrl} alt={player.name} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />;
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", background: "#EDEDED", display: "flex", alignItems: "center", justifyContent: "center",
      color: "#8A8F98", fontFamily: "'Oswald', sans-serif", fontWeight: 700, fontSize: size * 0.36, flexShrink: 0
    }}>
      {player.name.split(" ").map((w) => w[0]).join("")}
    </div>
  );
}

function getPrimaryPosition(posCounts) {
  let best = null, bestCount = 0;
  ALL_POS.forEach((pos) => {
    const c = posCounts[pos] || 0;
    if (c > bestCount) { best = pos; bestCount = c; }
  });
  return best;
}

function StatLeaderCard({ label, statKey, ranked, fmt }) {
  const leader = ranked[0];
  const rest = ranked.slice(1, 4);
  if (!leader) return null;
  return (
    <div style={{ background: `linear-gradient(135deg, #000000, ${BLUE_DK})`, borderRadius: 12, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "16px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <div>
          <div style={{ color: "rgba(255,255,255,0.75)", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 13, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</div>
          <div style={{ color: "#fff", fontFamily: "'Oswald', sans-serif", fontWeight: 700, fontSize: 34, lineHeight: 1.1, marginTop: 2 }}>{fmt(leader[statKey])}</div>
          <div style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, fontWeight: 600, marginTop: 4 }}>{leader.name}</div>
          <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 11.5 }}>{leader.primaryPos ? `${leader.primaryPos} · ` : ""}{leader.jersey}</div>
        </div>
        <PlayerAvatar player={leader} size={56} />
      </div>
      <div style={{ background: "#fff", padding: "6px 6px" }}>
        {rest.map((p) => (
          <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 8px" }}>
            <PlayerAvatar player={p} size={26} />
            <div style={{ flex: 1, fontSize: 13, fontWeight: 600, color: INK }}>{p.name}</div>
            <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 15, fontWeight: 700, color: NAVY }}>{fmt(p[statKey])}</div>
          </div>
        ))}
        {rest.length === 0 && <div style={{ padding: "8px 8px", fontSize: 12, color: "#B0B5BC" }}>Not enough players yet</div>}
      </div>
    </div>
  );
}

function TeamLeadersSection({ battingCalc, fielding }) {
  const enriched = useMemo(() => battingCalc.map((p) => ({
    ...p,
    photoUrl: p.photoUrl,
    primaryPos: fielding[p.name] ? getPrimaryPosition(fielding[p.name].posCounts) : null,
  })), [battingCalc, fielding]);

  function rankedBy(key) {
    return [...enriched].filter((p) => p.AB > 0 || key === "SO").sort((a, b) => (b[key] || 0) - (a[key] || 0));
  }

  const groups = [
    [{ key: "AVG", label: "Batting Average", fmt: fmtAvg }, { key: "OPS", label: "OPS", fmt: fmtAvg }, { key: "SLG", label: "Slugging", fmt: fmtAvg }],
    [{ key: "H", label: "Hits", fmt: (v) => String(v) }, { key: "1B", label: "Singles", fmt: (v) => String(v) }, { key: "2B", label: "Doubles", fmt: (v) => String(v) }],
    [{ key: "3B", label: "Triples", fmt: (v) => String(v) }, { key: "RBI", label: "Runs Batted In", fmt: (v) => String(v) }, { key: "SO", label: "Strikeouts", fmt: (v) => String(v) }],
  ];

  return (
    <div style={{ background: "#000", borderRadius: 12, padding: 20, marginTop: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <Trophy size={18} color={GOLD} />
        <div style={{ color: "#fff", fontFamily: "'Oswald', sans-serif", fontWeight: 700, fontSize: 20 }}>Team Leaders</div>
      </div>
      {groups.map((row, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginBottom: 14 }}>
          {row.map((s) => <StatLeaderCard key={s.key} label={s.label} statKey={s.key} fmt={s.fmt} ranked={rankedBy(s.key)} />)}
        </div>
      ))}
    </div>
  );
}


function StatCard({ label, value, sub, accent }) {
  return (
    <div style={{
      background: "#fff", borderRadius: 10, padding: "16px 18px", flex: "1 1 150px",
      borderLeft: `4px solid ${accent || GOLD}`, boxShadow: "0 1px 3px rgba(0,0,0,0.08)"
    }}>
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "#8A8F98", fontWeight: 600 }}>{label}</div>
      <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 30, color: NAVY, fontWeight: 600, lineHeight: 1.15, marginTop: 2 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: "#8A8F98", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function BalanceChip({ dev, balance }) {
  const color = balanceColor(dev);
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4, background: color + "1F", color,
      padding: "3px 9px", borderRadius: 999, fontWeight: 700, fontSize: 12.5, fontFamily: "'Barlow Condensed', sans-serif"
    }}>
      {balance > 0 ? <TrendingUp size={13} /> : balance < 0 ? <TrendingDown size={13} /> : <Minus size={13} />}
      {balance > 0 ? `+${balance} IF` : balance < 0 ? `${Math.abs(balance)} OF` : "Even"}
    </span>
  );
}

function FieldBar({ ofPct, ifPct, sitPct }) {
  return (
    <div style={{ display: "flex", height: 10, width: "100%", minWidth: 90, borderRadius: 5, overflow: "hidden", background: "#E2E2E2" }}>
      <div style={{ width: `${ifPct * 100}%`, background: INF_BLUE }} title={`Infield ${(ifPct * 100).toFixed(0)}%`} />
      <div style={{ width: `${ofPct * 100}%`, background: FIELD_GREEN }} title={`Outfield ${(ofPct * 100).toFixed(0)}%`} />
    </div>
  );
}

function SectionHeading({ children, icon: Icon }) {
  return (
    <h2 style={{
      fontFamily: "'Oswald', sans-serif", fontWeight: 600, fontSize: 20, color: NAVY,
      display: "flex", alignItems: "center", gap: 8, margin: "0 0 12px 0", letterSpacing: "0.01em"
    }}>
      {Icon && <Icon size={18} color={GOLD} />} {children}
    </h2>
  );
}

/* ======================== DASHBOARD TAB ======================== */

function DashboardTab({ games, batting, roster }) {
  const [typeFilter, setTypeFilter] = useState(["Regular Season"]);
  const filteredGames = useMemo(
    () => games.filter((g) => typeFilter.includes(g.gameType || "Regular Season")),
    [games, typeFilter]
  );
  const { rows: fielding, meanBalance } = useMemo(() => computeFielding(filteredGames, roster), [filteredGames, roster]);
  const battingCalc = useMemo(() => {
    const photoByName = Object.fromEntries(roster.map((p) => [p.name, p.photoUrl]));
    return computeBatting(batting).map((p) => ({ ...p, photoUrl: photoByName[p.name] || null })).sort((a, b) => b.AVG - a.AVG);
  }, [batting, roster]);
  const [sortKey, setSortKey] = useState("AVG");
  const [sortDir, setSortDir] = useState(-1);

  function toggleType(t) {
    setTypeFilter((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]));
  }

  const sortedBatting = useMemo(() => {
    const arr = [...battingCalc];
    arr.sort((a, b) => (a[sortKey] - b[sortKey]) * sortDir);
    return arr;
  }, [battingCalc, sortKey, sortDir]);

  const gamesPlayed = games.length;
  const lastGame = games[games.length - 1];
  const teamAB = batting.reduce((s, p) => s + (Number(p.AB) || 0), 0);
  const teamH = batting.reduce((s, p) => s + (Number(p.H) || 0), 0);
  const teamAvg = teamAB ? teamH / teamAB : 0;
  const topHitter = battingCalc[0];
  const mostBalanced = Object.values(fielding).reduce((best, r) => (Math.abs(r.deviation) < Math.abs(best.deviation) ? r : best), Object.values(fielding)[0] || {});

  function headerClick(key) {
    if (sortKey === key) setSortDir((d) => -d);
    else { setSortKey(key); setSortDir(-1); }
  }
  const cols = [
    ["AVG", "AVG"], ["OBP", "OBP"], ["OPS", "OPS"], ["SLG", "SLG"], ["H", "H"], ["1B", "1B"], ["2B", "2B"], ["3B", "3B"], ["HR", "HR"], ["RBI", "RBI"], ["R", "R"], ["SO", "SO"], ["FC", "FC"],
  ];

  return (
    <div>
      <div style={{
        background: `linear-gradient(120deg, #000000, ${BLUE_DK})`, borderRadius: 12, padding: "20px 24px",
        color: "#fff", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14
      }}>
        <div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.18em", fontSize: 12, color: GOLD, fontWeight: 700 }}>KITCHENER PANTHERS · U8 TIER 1</div>
          <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 30, fontWeight: 700, letterSpacing: "0.02em" }}>2026 SEASON TRACKER</div>
        </div>
        <div style={{ display: "flex", gap: 22, textAlign: "right" }}>
          <div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Games</div>
            <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 24, fontWeight: 600 }}>{gamesPlayed}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Last Game</div>
            <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 16, fontWeight: 500 }}>{lastGame ? lastGame.date : "—"}</div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
        <StatCard label="Team Batting Avg" value={fmtAvg(teamAvg)} sub={`${teamH} hits / ${teamAB} AB`} accent={GOLD} />
        <StatCard label="Top Hitter" value={topHitter ? topHitter.name.split(" ")[0] + " " + topHitter.name.split(" ")[1][0] + "." : "—"} sub={topHitter ? `${fmtAvg(topHitter.AVG)} AVG` : ""} accent={FIELD_GREEN} />
        <StatCard label="Most Balanced" value={mostBalanced ? mostBalanced.name.split(" ")[0] : "—"} sub={mostBalanced ? `${mostBalanced.balance >= 0 ? "+" : ""}${mostBalanced.balance} IF/OF` : ""} accent={INF_BLUE} />
        <StatCard label="Target Split" value="60/40" sub="IF / OF innings" accent={SIT_GRAY} />
      </div>

      <div style={{ background: "#fff", borderRadius: 12, padding: 20, marginBottom: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", overflowX: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
          <SectionHeading icon={LayoutDashboard}>Fielding Summary</SectionHeading>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {GAME_TYPES.map((t) => {
              const on = typeFilter.includes(t);
              return (
                <button key={t} onClick={() => toggleType(t)} style={{
                  fontSize: 11.5, fontWeight: 600, padding: "5px 11px", borderRadius: 999, cursor: "pointer",
                  border: `1px solid ${on ? "#000" : "#D5D5D5"}`, background: on ? "#000" : "#fff", color: on ? "#fff" : "#8A8F98",
                }}>{t}</button>
              );
            })}
          </div>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5, minWidth: 1180 }}>
          <thead>
            <tr style={{ textAlign: "right", color: "#8A8F98", fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.03em" }}>
              <th style={{ padding: "6px 6px", textAlign: "left" }}>#</th>
              <th style={{ padding: "6px 6px", textAlign: "left" }}>Player</th>
              {OUTFIELD.map((pos) => <th key={pos} style={{ padding: "6px 5px" }}>{pos}</th>)}
              {INFIELD.map((pos) => <th key={pos} style={{ padding: "6px 5px" }}>{pos}</th>)}
              <th style={{ padding: "6px 6px", borderLeft: "1px solid #E7E7E7" }}>OF Total</th>
              <th style={{ padding: "6px 6px" }}>OF %</th>
              <th style={{ padding: "6px 6px", borderLeft: "1px solid #E7E7E7" }}>IF Total</th>
              <th style={{ padding: "6px 6px" }}>IF %</th>
              <th style={{ padding: "6px 6px", borderLeft: "1px solid #E7E7E7" }}>Balance</th>
              <th style={{ padding: "6px 6px", borderLeft: "1px solid #E7E7E7" }}>SIT</th>
              <th style={{ padding: "6px 6px" }}>SIT %</th>
              <th style={{ padding: "6px 6px", borderLeft: "1px solid #E7E7E7" }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {roster.map((p) => {
              const r = fielding[p.name];
              return (
                <tr key={p.name} style={{ borderTop: "1px solid #E7E7E7" }}>
                  <td style={{ padding: "7px 6px", color: "#8A8F98" }}>{p.jersey}</td>
                  <td style={{ padding: "7px 6px", fontWeight: 600, color: INK, whiteSpace: "nowrap" }}>{p.name}</td>
                  {OUTFIELD.map((pos) => <td key={pos} style={{ padding: "7px 5px", textAlign: "right", color: (r.posCounts[pos] || 0) ? INK : "#D5D5D5" }}>{r.posCounts[pos] || 0}</td>)}
                  {INFIELD.map((pos) => <td key={pos} style={{ padding: "7px 5px", textAlign: "right", color: (r.posCounts[pos] || 0) ? INK : "#D5D5D5" }}>{r.posCounts[pos] || 0}</td>)}
                  <td style={{ padding: "7px 6px", textAlign: "right", borderLeft: "1px solid #E7E7E7", fontWeight: 700 }}>{r.of}</td>
                  <td style={{ padding: "7px 6px", textAlign: "right", color: "#8A8F98" }}>{Math.round(r.ofPct * 100)}%</td>
                  <td style={{ padding: "7px 6px", textAlign: "right", borderLeft: "1px solid #E7E7E7", fontWeight: 700 }}>{r.if}</td>
                  <td style={{ padding: "7px 6px", textAlign: "right", color: "#8A8F98" }}>{Math.round(r.ifPct * 100)}%</td>
                  <td style={{ padding: "7px 6px", borderLeft: "1px solid #E7E7E7" }}><BalanceChip dev={r.deviation} balance={r.balance} /></td>
                  <td style={{ padding: "7px 6px", textAlign: "right", borderLeft: "1px solid #E7E7E7", color: "#8A8F98" }}>{r.sit}</td>
                  <td style={{ padding: "7px 6px", textAlign: "right", color: "#8A8F98" }}>{Math.round(r.sitPct * 100)}%</td>
                  <td style={{ padding: "7px 6px", textAlign: "right", borderLeft: "1px solid #E7E7E7", fontWeight: 700 }}>{r.total}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div style={{ fontSize: 11.5, color: "#8A8F98", marginTop: 10 }}>
          {filteredGames.length === 0
            ? "No games match the selected filters."
            : <>Showing {filteredGames.length} of {games.length} logged games ({typeFilter.join(", ")}). Balance chip compares each player's IF−OF split against the team average ({meanBalance >= 0 ? "+" : ""}{meanBalance.toFixed(1)}) — darker means further from the team.</>
          }
        </div>
      </div>

      <div style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", overflowX: "auto" }}>
        <SectionHeading icon={TrendingUp}>Batting Summary</SectionHeading>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5, minWidth: 900 }}>
          <thead>
            <tr style={{ textAlign: "right", color: "#8A8F98", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              <th style={{ padding: "6px 8px", textAlign: "left" }}>#</th>
              <th style={{ padding: "6px 8px", textAlign: "left" }}>Player</th>
              <th style={{ padding: "6px 8px" }}>GP</th>
              <th style={{ padding: "6px 8px" }}>AB</th>
              {cols.map(([key, label]) => (
                <th key={key} onClick={() => headerClick(key)} style={{ padding: "6px 8px", cursor: "pointer", userSelect: "none" }}>
                  {label} {sortKey === key ? (sortDir === -1 ? "▼" : "▲") : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedBatting.map((p) => (
              <tr key={p.name} style={{ borderTop: "1px solid #E7E7E7" }}>
                <td style={{ padding: "8px", color: "#8A8F98" }}>{p.jersey}</td>
                <td style={{ padding: "8px", fontWeight: 600 }}>{p.name}</td>
                <td style={{ padding: "8px", textAlign: "right" }}>{p.GP}</td>
                <td style={{ padding: "8px", textAlign: "right" }}>{p.AB}</td>
                <td style={{ padding: "8px", textAlign: "right", fontWeight: 700, color: NAVY }}>{fmtAvg(p.AVG)}</td>
                <td style={{ padding: "8px", textAlign: "right" }}>{fmtAvg(p.OBP)}</td>
                <td style={{ padding: "8px", textAlign: "right" }}>{fmtAvg(p.OPS)}</td>
                <td style={{ padding: "8px", textAlign: "right" }}>{fmtAvg(p.SLG)}</td>
                <td style={{ padding: "8px", textAlign: "right" }}>{p.H}</td>
                <td style={{ padding: "8px", textAlign: "right" }}>{p["1B"]}</td>
                <td style={{ padding: "8px", textAlign: "right" }}>{p["2B"]}</td>
                <td style={{ padding: "8px", textAlign: "right" }}>{p["3B"]}</td>
                <td style={{ padding: "8px", textAlign: "right" }}>{p.HR}</td>
                <td style={{ padding: "8px", textAlign: "right" }}>{p.RBI}</td>
                <td style={{ padding: "8px", textAlign: "right" }}>{p.R}</td>
                <td style={{ padding: "8px", textAlign: "right" }}>{p.SO}</td>
                <td style={{ padding: "8px", textAlign: "right" }}>{p.FC || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <TeamLeadersSection battingCalc={battingCalc} fielding={fielding} />
    </div>
  );
}

/* ======================== PLAYERS TAB ======================== */

function PlayerDetail({ player, games, roster, battingRow, onUploadPhoto }) {
  const { rows: fielding } = useMemo(() => computeFielding(games, roster), [games, roster]);
  const r = fielding[player.name];
  const pieData = [
    { name: "Infield", value: r.if, color: INF_BLUE },
    { name: "Outfield", value: r.of, color: FIELD_GREEN },
    { name: "Bench", value: r.sit, color: SIT_GRAY },
  ].filter((d) => d.value > 0);

  const posBarData = ALL_POS.map((pos) => ({ pos, innings: r.posCounts[pos] || 0 })).filter((d) => d.innings > 0);
  const b = battingRow ? computeBatting([battingRow])[0] : null;
  const [uploading, setUploading] = useState(false);
  const fileInputRef = React.useRef(null);

  async function handlePhotoChange(e) {
    const file = e.target.files && e.target.files[0];
    if (!file || !onUploadPhoto) return;
    setUploading(true);
    const result = await onUploadPhoto(player.id, file);
    setUploading(false);
    if (result && result.error) {
      window.alert("Photo upload failed:\n\n" + result.error);
    }
    e.target.value = "";
  }

  const gameLog = games.map((g) => {
    const entry = g.players[player.name];
    const positions = (entry && entry.positions) || [];
    const played = positions.some((v) => !!v);
    return { ...g, positions, played };
  });

  return (
    <div style={{ background: "#fff", borderRadius: 12, padding: 22, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ position: "relative", width: 64, height: 64, flexShrink: 0 }}>
            {player.photoUrl ? (
              <img src={player.photoUrl} alt={player.name} style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover", border: `2px solid ${NAVY}` }} />
            ) : (
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: PAPER, border: `2px dashed #D5D5D5`, display: "flex", alignItems: "center", justifyContent: "center", color: "#B0B5BC", fontFamily: "'Oswald', sans-serif", fontSize: 20, fontWeight: 700 }}>
                {player.name.split(" ").map((w) => w[0]).join("")}
              </div>
            )}
            {onUploadPhoto && (
              <button onClick={() => fileInputRef.current && fileInputRef.current.click()} disabled={uploading} title="Upload photo" style={{
                position: "absolute", bottom: -2, right: -2, width: 22, height: 22, borderRadius: "50%", background: BLUE, border: "2px solid #fff",
                display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff"
              }}>
                {uploading ? <Loader2 size={11} className="spin" /> : <PlusCircle size={11} />}
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhotoChange} />
          </div>
          <div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", color: GOLD, fontWeight: 700, letterSpacing: "0.08em", fontSize: 12 }}>{player.jersey} · KITCHENER PANTHERS</div>
            <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 28, color: NAVY, fontWeight: 700 }}>{player.name}</div>
          </div>
        </div>
        <BalanceChip dev={r.deviation} balance={r.balance} />
      </div>

      <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginBottom: 20 }}>
        <div style={{ flex: "1 1 220px", minWidth: 220 }}>
          <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em", color: "#8A8F98", marginBottom: 6, fontWeight: 600 }}>Fielding Breakdown</div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={70} paddingAngle={2}>
                {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div style={{ flex: "1 1 300px", minWidth: 260 }}>
          <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em", color: "#8A8F98", marginBottom: 6, fontWeight: 600 }}>Innings by Position</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={posBarData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E7E7E7" />
              <XAxis dataKey="pos" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="innings">
                {posBarData.map((d, i) => <Cell key={i} fill={POS_COLOR[d.pos]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {b && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em", color: "#8A8F98", marginBottom: 8, fontWeight: 600 }}>Batting Line</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {[["AVG", fmtAvg(b.AVG)], ["OBP", fmtAvg(b.OBP)], ["OPS", fmtAvg(b.OPS)], ["SLG", fmtAvg(b.SLG)], ["H", b.H], ["AB", b.AB], ["RBI", b.RBI], ["R", b.R], ["SO", b.SO]].map(([k, v]) => (
              <div key={k} style={{ background: PAPER, borderRadius: 8, padding: "8px 14px", minWidth: 62, textAlign: "center" }}>
                <div style={{ fontSize: 10, color: "#8A8F98", textTransform: "uppercase", fontWeight: 700 }}>{k}</div>
                <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 18, color: NAVY, fontWeight: 600 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em", color: "#8A8F98", marginBottom: 8, fontWeight: 600 }}>Game Log</div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5, minWidth: 560 }}>
            <thead>
              <tr style={{ textAlign: "left", color: "#8A8F98", fontSize: 10.5, textTransform: "uppercase" }}>
                <th style={{ padding: "5px 6px" }}>#</th><th style={{ padding: "5px 6px" }}>Date</th><th style={{ padding: "5px 6px" }}>Opponent</th>
                {[1,2,3,4,5,6,7].map((n) => <th key={n} style={{ padding: "5px 6px", textAlign: "center" }}>I{n}</th>)}
              </tr>
            </thead>
            <tbody>
              {gameLog.map((g) => (
                <tr key={g.gameNum} style={{ borderTop: "1px solid #E7E7E7" }}>
                  <td style={{ padding: "5px 6px", color: "#8A8F98" }}>{g.gameNum}</td>
                  <td style={{ padding: "5px 6px" }}>{g.date}</td>
                  <td style={{ padding: "5px 6px" }}>{g.opponent}</td>
                  {!g.played ? (
                    <td colSpan={7} style={{ padding: "5px 6px", textAlign: "center", color: "#B0B5BC", fontStyle: "italic" }}>Absent</td>
                  ) : g.positions.map((pos, i) => (
                    <td key={i} style={{ padding: "4px 4px", textAlign: "center" }}>
                      {pos ? (
                        <span style={{ background: (POS_COLOR[pos] || SIT_GRAY) + (pos === "SIT" ? "" : "22"), color: pos === "SIT" ? "#8A8F98" : POS_COLOR[pos], fontWeight: 700, borderRadius: 5, padding: "2px 5px", fontSize: 11 }}>{pos}</span>
                      ) : ""}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function PlayersTab({ games, batting, roster, onUploadPhoto }) {
  const [selected, setSelected] = useState(null);
  const { rows: fielding } = useMemo(() => computeFielding(games, roster), [games, roster]);
  const battingByName = useMemo(() => Object.fromEntries(batting.map((b) => [b.name, b])), [batting]);

  if (selected) {
    return (
      <div>
        <button onClick={() => setSelected(null)} style={{
          display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", color: NAVY, fontWeight: 600,
          cursor: "pointer", marginBottom: 14, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, padding: 0
        }}>
          <ChevronRight style={{ transform: "rotate(180deg)" }} size={16} /> All Players
        </button>
        <PlayerDetail player={selected} games={games} roster={roster} battingRow={battingByName[selected.name]} onUploadPhoto={onUploadPhoto} />
      </div>
    );
  }

  return (
    <div>
      <SectionHeading icon={Users}>Roster</SectionHeading>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
        {roster.map((p) => {
          const r = fielding[p.name];
          const b = battingByName[p.name];
          const avg = b ? (b.AB ? b.H / b.AB : 0) : 0;
          return (
            <button key={p.name} onClick={() => setSelected(p)} style={{
              textAlign: "left", background: "#fff", borderRadius: 12, padding: 16, border: "1px solid #E7E7E7", cursor: "pointer",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)", transition: "transform .1s"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {p.photoUrl ? (
                    <img src={p.photoUrl} alt={p.name} style={{ width: 38, height: 38, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: 38, height: 38, borderRadius: "50%", background: PAPER, border: "1px dashed #D5D5D5", display: "flex", alignItems: "center", justifyContent: "center", color: "#B0B5BC", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                      {p.name.split(" ").map((w) => w[0]).join("")}
                    </div>
                  )}
                  <div>
                    <div style={{ fontSize: 11, color: GOLD, fontWeight: 700, fontFamily: "'Barlow Condensed', sans-serif" }}>{p.jersey}</div>
                    <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 17, color: NAVY, fontWeight: 600 }}>{p.name}</div>
                  </div>
                </div>
                <ChevronRight size={16} color="#B0B5BC" />
              </div>
              <div style={{ display: "flex", gap: 14, marginTop: 10, fontSize: 12.5 }}>
                <div><span style={{ color: "#8A8F98" }}>AVG </span><b style={{ color: INK }}>{fmtAvg(avg)}</b></div>
                <div><span style={{ color: "#8A8F98" }}>Bal </span><b style={{ color: balanceColor(r.deviation) }}>{r.balance >= 0 ? "+" : ""}{r.balance}</b></div>
              </div>
              <div style={{ marginTop: 8 }}><FieldBar ofPct={r.ofPct} ifPct={r.ifPct} /></div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ======================== MVP TAB ======================== */

function MvpTab({ games, roster, mvpAwards, onAward, onRemoveAward }) {
  const [selectedPlayer, setSelectedPlayer] = useState(roster[0]?.name || "");
  const [contextType, setContextType] = useState("game");
  const [selectedGame, setSelectedGame] = useState("");
  const [practiceDate, setPracticeDate] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const counts = useMemo(() => {
    const c = {};
    roster.forEach((p) => { c[p.name] = 0; });
    mvpAwards.forEach((a) => { if (c[a.name] !== undefined) c[a.name] += 1; });
    return c;
  }, [mvpAwards, roster]);

  const sorted = useMemo(() => [...roster].sort((a, b) => (counts[b.name] || 0) - (counts[a.name] || 0)), [roster, counts]);
  const maxCount = Math.max(1, ...roster.map((p) => counts[p.name] || 0));
  const top3 = sorted.slice(0, 3);
  const hasAnyAwards = mvpAwards.length > 0;

  async function handleAward() {
    if (!selectedPlayer) return;
    if (contextType === "practice" && !practiceDate.trim()) { setErrMsg("Add a practice date first."); return; }
    setSaving(true);
    setErrMsg("");
    let award;
    if (contextType === "practice") {
      award = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: selectedPlayer,
        gameNum: null,
        context: "practice",
        practiceDate: practiceDate.trim(),
        gameLabel: `Practice · ${practiceDate.trim()}`,
        awardedAt: new Date().toISOString(),
      };
    } else {
      const game = games.find((g) => String(g.gameNum) === String(selectedGame));
      award = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: selectedPlayer,
        gameNum: game ? game.gameNum : null,
        context: "game",
        gameLabel: game ? `Game ${game.gameNum} · ${game.date} · ${game.opponent}` : "No game specified",
        awardedAt: new Date().toISOString(),
      };
    }
    await onAward(award);
    setSaving(false);
    setSelectedGame("");
    setPracticeDate("");
  }

  async function handleRemove(id) {
    await onRemoveAward(id);
  }

  const podiumOrder = [top3[1], top3[0], top3[2]];
  const podiumRanks = ["2nd", "1st", "3rd"];
  const podiumHeights = [92, 118, 76];
  const segBtnStyle = (active) => ({
    flex: 1, padding: "8px 10px", borderRadius: 7, border: `1px solid ${active ? "#000" : "#D5D5D5"}`,
    background: active ? "#000" : "#fff", color: active ? "#fff" : "#8A8F98", fontWeight: 700, fontSize: 13,
    cursor: "pointer", fontFamily: "'Barlow Condensed', sans-serif",
  });

  return (
    <div>
      <SectionHeading icon={Trophy}>MVP Awards</SectionHeading>

      <div style={{ background: "#fff", borderRadius: 12, padding: 20, marginBottom: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
        <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em", color: "#8A8F98", marginBottom: 10, fontWeight: 700 }}>Award MVP</div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: "1 1 200px" }}>
            <label style={labelStyle}>Player</label>
            <select style={inputStyle} value={selectedPlayer} onChange={(e) => setSelectedPlayer(e.target.value)}>
              {roster.map((p) => <option key={p.name} value={p.name}>{p.jersey} {p.name}</option>)}
            </select>
          </div>
          <div style={{ flex: "1 1 140px" }}>
            <label style={labelStyle}>Awarded at</label>
            <div style={{ display: "flex", gap: 6 }}>
              <button type="button" onClick={() => setContextType("game")} style={segBtnStyle(contextType === "game")}>Game</button>
              <button type="button" onClick={() => setContextType("practice")} style={segBtnStyle(contextType === "practice")}>Practice</button>
            </div>
          </div>
          {contextType === "practice" ? (
            <div style={{ flex: "1 1 200px" }}>
              <label style={labelStyle}>Practice Date</label>
              <input style={inputStyle} placeholder="e.g. July 10, 2026" value={practiceDate} onChange={(e) => setPracticeDate(e.target.value)} />
            </div>
          ) : (
            <div style={{ flex: "1 1 220px" }}>
              <label style={labelStyle}>Game (optional)</label>
              <select style={inputStyle} value={selectedGame} onChange={(e) => setSelectedGame(e.target.value)}>
                <option value="">No specific game</option>
                {games.slice().reverse().map((g) => <option key={g.gameNum} value={g.gameNum}>Game {g.gameNum} · {g.date} · {g.opponent}</option>)}
              </select>
            </div>
          )}
          <button onClick={handleAward} disabled={saving || !selectedPlayer} style={primaryBtnStyle}>
            {saving ? <Loader2 size={15} className="spin" /> : <Award size={15} />} Award MVP
          </button>
        </div>
        {errMsg && <div style={{ fontSize: 12.5, color: "#000", marginTop: 8 }}>{errMsg}</div>}
      </div>

      {!hasAnyAwards ? (
        <div style={{ background: "#fff", borderRadius: 12, padding: 32, textAlign: "center", color: "#8A8F98", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
          No MVP awards yet this season — hand out the first one above.
        </div>
      ) : (
        <>
          <div style={{ background: "#fff", borderRadius: 12, padding: "24px 20px 16px", marginBottom: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em", color: "#8A8F98", fontWeight: 700 }}>Season Leaders</div>
              <span style={{ fontSize: 11, fontWeight: 700, background: PAPER, border: "1px solid #E7E7E7", borderRadius: 999, padding: "3px 10px", color: "#8A8F98" }}>{mvpAwards.length} awarded</span>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 14, marginBottom: 8 }}>
              {podiumOrder.map((p, i) => {
                if (!p) return <div key={i} style={{ width: 92 }} />;
                const isLead = i === 1;
                const count = counts[p.name] || 0;
                return (
                  <div key={p.name} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 92 }}>
                    <div style={{
                      width: 46, height: 46, borderRadius: "50%", background: isLead ? BLUE : "#000",
                      display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
                      fontFamily: "'Oswald', sans-serif", fontSize: 17, fontWeight: 700, marginBottom: 6,
                      border: isLead ? "3px solid #000" : "none"
                    }}>{count}</div>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: INK, textAlign: "center", lineHeight: 1.2 }}>{p.name.split(" ")[0]}<br />{p.name.split(" ")[1]}</div>
                    <div style={{
                      width: "100%", height: podiumHeights[i], marginTop: 8, borderRadius: "6px 6px 0 0",
                      background: isLead ? BLUE : "#EDEDED", display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 8
                    }}>
                      <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 13, color: isLead ? "#fff" : "#8A8F98" }}>{podiumRanks[i]}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ background: "#fff", borderRadius: 12, padding: 20, marginBottom: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
            <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em", color: "#8A8F98", marginBottom: 12, fontWeight: 700 }}>Full Leaderboard</div>
            {sorted.map((p) => {
              const count = counts[p.name] || 0;
              const isLead = count === maxCount && count > 0;
              return (
                <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderTop: "1px solid #EFEEE9" }}>
                  <div style={{ fontSize: 11, color: "#8A8F98", width: 30, flexShrink: 0 }}>{p.jersey}</div>
                  <div style={{ flex: "1 1 140px", fontSize: 13.5, fontWeight: 600, color: INK }}>{p.name}</div>
                  <div style={{ flex: "1 1 100px", height: 6, background: "#EDEDED", borderRadius: 3, overflow: "hidden", maxWidth: 140 }}>
                    <div style={{ width: `${(count / maxCount) * 100}%`, height: "100%", background: isLead ? BLUE : "#8A8F98", borderRadius: 3 }} />
                  </div>
                  <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 16, fontWeight: 700, color: isLead ? BLUE : INK, width: 22, textAlign: "right" }}>{count}</div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <button onClick={() => setShowHistory((s) => !s)} style={{ background: "none", border: "none", color: NAVY, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, padding: 0, marginBottom: 10, fontFamily: "'Barlow Condensed', sans-serif" }}>
        {showHistory ? <ChevronDown size={16} /> : <ChevronRight size={16} />} Award History ({mvpAwards.length})
      </button>
      {showHistory && (
        <div style={{ background: "#fff", borderRadius: 12, padding: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
          {mvpAwards.length === 0 && <div style={{ color: "#8A8F98", fontSize: 13.5 }}>No awards logged yet.</div>}
          {mvpAwards.slice().reverse().map((a) => (
            <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 4px", borderBottom: "1px solid #E7E7E7", fontSize: 13.5 }}>
              <span><b>{a.name}</b> · {a.gameLabel}</span>
              <button onClick={() => handleRemove(a.id)} style={{ background: "none", border: "none", color: "#000", cursor: "pointer" }}><Trash2 size={15} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ======================== ADD GAME TAB ======================== */

const POS_OPTIONS = ["", "P", "C", "1B", "2B", "3B", "SS", "LF", "LC", "RC", "RF", "SIT"];

/* ======================== LINEUP CARD (PRINT) ======================== */

function MiniFieldDiagram({ size = 108 }) {
  const dot = (x, y, label, cls) => (
    <g key={label}>
      <circle cx={x} cy={y} r={9.5} fill={cls === "if" ? "#000000" : BLUE} />
      <text x={x} y={y + 3.3} textAnchor="middle" fontSize="8.5" fontWeight="700" fill="#fff" fontFamily="'Barlow Condensed', sans-serif">{label}</text>
    </g>
  );
  return (
    <svg viewBox="0 0 140 120" width={size} height={(size * 120) / 140}>
      <rect x="0" y="0" width="140" height="66" rx="6" fill="#EEF3F8" />
      <polygon points="70,108 112,70 70,34 28,70" fill="#FAFAF8" stroke="#000" strokeWidth="1.2" />
      <line x1="70" y1="108" x2="112" y2="70" stroke="#B8BCC0" strokeWidth="1" />
      <line x1="70" y1="108" x2="28" y2="70" stroke="#B8BCC0" strokeWidth="1" />
      {dot(70, 18, "LF", "of")}
      {dot(52, 10, "LC", "of")}
      {dot(88, 10, "RC", "of")}
      {dot(108, 18, "RF", "of")}
      {dot(46, 58, "SS", "if")}
      {dot(94, 55, "2B", "if")}
      {dot(70, 76, "P", "if")}
      {dot(38, 78, "3B", "if")}
      {dot(103, 78, "1B", "if")}
      {dot(70, 104, "C", "if")}
    </svg>
  );
}

function chipStyle(pos) {
  if (pos === "SIT") return { background: "#fff", color: "#000", border: "2px solid #000" };
  if (INFIELD.includes(pos)) return { background: "#000", color: "#fff", border: "none" };
  return { background: BLUE, color: "#fff", border: "none" };
}

function LineupCard({ draft, roster }) {
  const rows = roster.map((p) => {
    const entry = draft.players[p.name] || { positions: [null,null,null,null,null,null,null], absent: false };
    return { p, positions: entry.positions, absent: !!entry.absent };
  });
  return (
    <div style={{
      width: "5.15in", height: "6.8in", background: "#fff", border: "1.5px solid #000", borderRadius: 6,
      padding: "0.14in 0.16in", boxSizing: "border-box", display: "flex", flexDirection: "column", fontFamily: "'Inter', sans-serif",
      breakInside: "avoid"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, borderBottom: "2px solid #000", paddingBottom: "0.07in", marginBottom: "0.08in" }}>
        <img src={PANTHERS_LOGO} alt="Panthers" style={{ width: "0.85in", height: "0.85in", objectFit: "contain", flexShrink: 0 }} />
        <div style={{ flex: 1, textAlign: "center", padding: "0 4px" }}>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9.5, letterSpacing: "0.1em", color: BLUE_DK, fontWeight: 700 }}>{draft.date || "GAME DATE"}</div>
          <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 17, fontWeight: 700, color: "#000", lineHeight: 1.15 }}>Panthers</div>
          <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 12.5, fontWeight: 500, color: "#000" }}>{draft.opponent || "vs Opponent"}</div>
          {draft.gameType && draft.gameType !== "Regular Season" && (
            <div style={{ fontSize: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#fff", background: "#000", borderRadius: 999, padding: "1px 7px", display: "inline-block", marginTop: 2 }}>{draft.gameType}</div>
          )}
        </div>
        <MiniFieldDiagram size={80} />
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 18, flex: 1 }}>
        <thead>
          <tr style={{ background: "#000", color: "#fff" }}>
            <th style={{ padding: "5px 3px", fontWeight: 700, fontSize: 15.5 }}>#</th>
            <th style={{ padding: "5px 5px", textAlign: "left", fontWeight: 700, fontSize: 15.5 }}>Player</th>
            {[1,2,3,4,5,6,7].map((n) => <th key={n} style={{ padding: "5px 2px", fontWeight: 700, fontSize: 15.5 }}>{n}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.p.name} style={{ background: i % 2 === 1 ? "#F3F5F7" : "#fff" }}>
              <td style={{ padding: "5px 3px", textAlign: "center", color: "#8A8F98", borderBottom: "1.5px solid #888888", fontWeight: 600, fontSize: 17.5 }}>{i + 1}</td>
              <td style={{ padding: "5px 5px", fontWeight: 700, whiteSpace: "nowrap", borderBottom: "1.5px solid #888888", fontSize: 17.5 }}>{r.p.jersey} {r.p.name.split(" ")[0]} {r.p.name.split(" ")[1] ? r.p.name.split(" ")[1][0] + "." : ""}</td>
              {r.absent ? (
                <td colSpan={7} style={{ padding: "5px 3px", textAlign: "center", color: "#B0B5BC", fontStyle: "italic", borderBottom: "1.5px solid #888888" }}>Absent</td>
              ) : r.positions.map((pos, j) => (
                <td key={j} style={{ padding: "3.5px 1px", textAlign: "center", borderBottom: "1.5px solid #888888" }}>
                  {pos ? (
                    <span style={{
                      display: "inline-block", minWidth: 32, fontWeight: 700, fontSize: 16, borderRadius: 4, padding: "2px 3px",
                      ...chipStyle(pos)
                    }}>{pos}</span>
                  ) : ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ textAlign: "center", fontSize: 7.5, color: "#8A8F98", marginTop: "0.06in", borderTop: "1px solid #E7E7E7", paddingTop: "0.05in" }}>
        KITCHENER PANTHERS · 2026 U8 TIER 1 · BENCH CARD
      </div>
    </div>
  );
}


function AddGameTab({ games, roster, onSave, onDelete, onAddPlayer, onReorderRoster }) {
  const nextNum = games.length ? Math.max(...games.map((g) => g.gameNum)) + 1 : 1;
  const [draft, setDraft] = useState(() => emptyGame(nextNum, roster));
  const [expanded, setExpanded] = useState(false);
  const [viewingGame, setViewingGame] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
  const [dragIndex, setDragIndex] = useState(null);
  const [addingPlayer, setAddingPlayer] = useState(false);
  const [newJersey, setNewJersey] = useState("");
  const [newName, setNewName] = useState("");
  const [addErr, setAddErr] = useState("");
  const [showCards, setShowCards] = useState(false);

  useEffect(() => { setDraft(emptyGame(nextNum, roster)); }, [games.length]);

  // Keep the draft in sync when a new player is added mid-edit, without wiping what's already been entered.
  useEffect(() => {
    setDraft((d) => {
      let changed = false;
      const players = { ...d.players };
      roster.forEach((p) => {
        if (!players[p.name]) {
          players[p.name] = { jersey: p.jersey, positions: [null, null, null, null, null, null, null], absent: false };
          changed = true;
        }
      });
      return changed ? { ...d, players } : d;
    });
  }, [roster]);

  function updatePos(name, inningIdx, value) {
    setDraft((d) => ({
      ...d,
      players: {
        ...d.players,
        [name]: { ...d.players[name], positions: d.players[name].positions.map((p, i) => (i === inningIdx ? (value || null) : p)) },
      },
    }));
  }

  function toggleAbsent(name) {
    setDraft((d) => {
      const cur = d.players[name];
      const nowAbsent = !cur.absent;
      return {
        ...d,
        players: {
          ...d.players,
          [name]: { ...cur, absent: nowAbsent, positions: nowAbsent ? [null, null, null, null, null, null, null] : cur.positions },
        },
      };
    });
  }

  // Positions already claimed by someone else in a given inning (SIT is exempt — several players sit at once).
  function usedInInning(inningIdx, excludeName) {
    const used = new Set();
    roster.forEach((p) => {
      if (p.name === excludeName) return;
      const entry = draft.players[p.name];
      if (!entry || entry.absent) return;
      const val = entry.positions[inningIdx];
      if (val && val !== "SIT") used.add(val);
    });
    return used;
  }

  async function handleSave() {
    if (!draft.date || !draft.opponent) { setSavedMsg("Add a date and opponent first."); return; }
    setSaving(true);
    const cleanedPlayers = {};
    Object.entries(draft.players).forEach(([name, entry]) => {
      cleanedPlayers[name] = { jersey: entry.jersey, positions: entry.positions };
    });
    const gameToSave = { gameNum: draft.gameNum, date: draft.date, opponent: draft.opponent, gameType: draft.gameType || "Regular Season", players: cleanedPlayers };
    const updated = [...games, gameToSave];
    const ok = await onSave(updated);
    setSaving(false);
    setSavedMsg(ok ? `Game ${draft.gameNum} saved.` : "Couldn't save — try again.");
    if (ok) setDraft(emptyGame(draft.gameNum + 1, roster));
    setTimeout(() => setSavedMsg(""), 3000);
  }

  function handleAddPlayerSubmit() {
    const name = newName.trim();
    const jersey = newJersey.trim();
    if (!name) { setAddErr("Enter a player name."); return; }
    if (roster.some((p) => p.name.toLowerCase() === name.toLowerCase())) { setAddErr("That player is already on the roster."); return; }
    onAddPlayer({ jersey: jersey ? (jersey.startsWith("#") ? jersey : `#${jersey}`) : "#—", name });
    setNewJersey(""); setNewName(""); setAddingPlayer(false); setAddErr("");
  }

  function reorder(from, to) {
    if (from === to || from == null || to == null) return;
    const nr = [...roster];
    const [moved] = nr.splice(from, 1);
    nr.splice(to, 0, moved);
    onReorderRoster(nr);
  }

  function moveUp(i) { if (i === 0) return; const nr = [...roster]; [nr[i - 1], nr[i]] = [nr[i], nr[i - 1]]; onReorderRoster(nr); }
  function moveDown(i) { if (i === roster.length - 1) return; const nr = [...roster]; [nr[i + 1], nr[i]] = [nr[i], nr[i + 1]]; onReorderRoster(nr); }

  return (
    <div>
      <div className="no-print">
      <SectionHeading icon={PlusCircle}>Log a New Game</SectionHeading>

      <div style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 16 }}>
          <div>
            <label style={labelStyle}>Game #</label>
            <div style={{ ...inputStyle, background: PAPER, width: 70, textAlign: "center" }}>{draft.gameNum}</div>
          </div>
          <div style={{ flex: "1 1 180px" }}>
            <label style={labelStyle}>Date</label>
            <input style={inputStyle} placeholder="e.g. July 12, 2026" value={draft.date} onChange={(e) => setDraft((d) => ({ ...d, date: e.target.value }))} />
          </div>
          <div style={{ flex: "1 1 220px" }}>
            <label style={labelStyle}>Opponent</label>
            <input style={inputStyle} placeholder="e.g. vs Cambridge 1" value={draft.opponent} onChange={(e) => setDraft((d) => ({ ...d, opponent: e.target.value }))} />
          </div>
          <div style={{ flex: "1 1 170px" }}>
            <label style={labelStyle}>Game Type</label>
            <select style={inputStyle} value={draft.gameType || "Regular Season"} onChange={(e) => setDraft((d) => ({ ...d, gameType: e.target.value }))}>
              {GAME_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div style={{ fontSize: 11.5, color: "#8A8F98", marginBottom: 8 }}>
          Drag <GripVertical size={11} style={{ verticalAlign: "-2px" }} /> or use the arrows to reorder the batting lineup — this order carries through the whole app. Positions already taken in an inning grey out for everyone else; SIT can be used by more than one player.
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5, minWidth: 780 }}>
            <thead>
              <tr style={{ textAlign: "left", color: "#8A8F98", fontSize: 10.5, textTransform: "uppercase" }}>
                <th style={{ padding: "5px 4px", width: 46 }}></th>
                <th style={{ padding: "5px 6px" }}>Player</th>
                {[1,2,3,4,5,6,7].map((n) => <th key={n} style={{ padding: "5px 4px", textAlign: "center" }}>Inn {n}</th>)}
                <th style={{ padding: "5px 6px", textAlign: "center" }}>Absent</th>
              </tr>
            </thead>
            <tbody>
              {roster.map((p, idx) => {
                const entry = draft.players[p.name] || { positions: [null,null,null,null,null,null,null], absent: false };
                const positions = entry.positions;
                const isAbsent = !!entry.absent;
                return (
                  <tr key={p.name}
                    draggable
                    onDragStart={() => setDragIndex(idx)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => { reorder(dragIndex, idx); setDragIndex(null); }}
                    style={{ borderTop: "1px solid #E7E7E7", background: isAbsent ? "#FAFAFA" : "transparent" }}>
                    <td style={{ padding: "3px 4px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <span style={{ cursor: "grab", color: "#B0B5BC", display: "flex" }} title="Drag to reorder"><GripVertical size={15} /></span>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <button onClick={() => moveUp(idx)} disabled={idx === 0} style={arrowBtnStyle}><ChevronUp size={12} /></button>
                          <button onClick={() => moveDown(idx)} disabled={idx === roster.length - 1} style={arrowBtnStyle}><ChevronDown size={12} /></button>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "5px 6px", fontWeight: 600, whiteSpace: "nowrap", opacity: isAbsent ? 0.45 : 1 }}>{p.jersey} {p.name}</td>
                    {positions.map((val, i) => {
                      const used = usedInInning(i, p.name);
                      return (
                        <td key={i} style={{ padding: "3px" }}>
                          <select value={val || ""} disabled={isAbsent} onChange={(e) => updatePos(p.name, i, e.target.value)}
                            style={{
                              width: 58, padding: "3px 2px", borderRadius: 5, border: "1px solid #D5D5D5", fontSize: 12,
                              background: isAbsent ? "#EDEDED" : val ? (POS_COLOR[val] || SIT_GRAY) + "22" : "#fff",
                              color: isAbsent ? "#B0B5BC" : "inherit", cursor: isAbsent ? "not-allowed" : "pointer"
                            }}>
                            {POS_OPTIONS.map((o) => (
                              <option key={o} value={o} disabled={o !== "" && o !== "SIT" && used.has(o)} style={{ color: used.has(o) ? "#C7C7C7" : "inherit" }}>
                                {o || "—"}{o && o !== "SIT" && used.has(o) ? " (taken)" : ""}
                              </option>
                            ))}
                          </select>
                        </td>
                      );
                    })}
                    <td style={{ padding: "3px", textAlign: "center" }}>
                      <button onClick={() => toggleAbsent(p.name)} title="Toggle absent for the full game" style={{
                        width: 40, height: 22, borderRadius: 999, border: "none", cursor: "pointer", position: "relative",
                        background: isAbsent ? "#000000" : "#D5D5D5", transition: "background .15s"
                      }}>
                        <span style={{
                          position: "absolute", top: 2, left: isAbsent ? 20 : 2, width: 18, height: 18, borderRadius: "50%",
                          background: "#fff", transition: "left .15s", boxShadow: "0 1px 2px rgba(0,0,0,0.3)"
                        }} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {!addingPlayer ? (
          <button onClick={() => setAddingPlayer(true)} style={{ ...ghostBtnStyle, marginTop: 14 }}>
            <PlusCircle size={14} /> Add Player
          </button>
        ) : (
          <div style={{ display: "flex", gap: 10, alignItems: "flex-end", marginTop: 14, flexWrap: "wrap", background: PAPER, padding: 12, borderRadius: 8 }}>
            <div>
              <label style={labelStyle}>Jersey #</label>
              <input style={{ ...inputStyle, width: 80 }} placeholder="#100" value={newJersey} onChange={(e) => setNewJersey(e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Name</label>
              <input style={{ ...inputStyle, width: 180 }} placeholder="New player name" value={newName} onChange={(e) => setNewName(e.target.value)} />
            </div>
            <button onClick={handleAddPlayerSubmit} style={primaryBtnStyle}><Save size={14} /> Add to Roster</button>
            <button onClick={() => { setAddingPlayer(false); setAddErr(""); }} style={ghostBtnStyle}>Cancel</button>
            {addErr && <span style={{ fontSize: 12.5, color: "#000" }}>{addErr}</span>}
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
          <button onClick={handleSave} disabled={saving} style={primaryBtnStyle}>
            {saving ? <Loader2 size={15} className="spin" /> : <Save size={15} />} Save Game
          </button>
          <button onClick={() => setShowCards((s) => !s)} style={ghostBtnStyle}>
            <Printer size={14} /> {showCards ? "Hide" : "Export"} Lineup Cards
          </button>
          {savedMsg && <span style={{ fontSize: 13, color: savedMsg.includes("saved") ? GREENOK : "#000000" }}>{savedMsg}</span>}
        </div>
      </div>
      </div>

      {showCards && (
        <div style={{ marginBottom: 20 }}>
          <style>{`
            @media print {
              @page { size: 11in 8.5in; margin: 0.2in; }
              .no-print { display: none !important; }
              .lineup-print-wrap { display: flex !important; padding: 0 !important; background: #fff !important; border-radius: 0 !important; overflow: visible !important; }
            }
          `}</style>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 12.5, color: "#8A8F98" }}>Preview — two identical cards, ready to cut and sleeve for the bench.</div>
            <button onClick={() => window.print()} style={primaryBtnStyle}><Printer size={14} /> Print</button>
          </div>
          <div className="lineup-print-wrap" style={{ display: "flex", gap: 0, justifyContent: "center", background: "#F0F0F0", padding: 16, borderRadius: 10, overflowX: "auto" }}>
            <LineupCard draft={draft} roster={roster} />
            <LineupCard draft={draft} roster={roster} />
          </div>
        </div>
      )}

      <div className="no-print">
      <button onClick={() => setExpanded((e) => !e)} style={{ background: "none", border: "none", color: NAVY, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, padding: 0, marginBottom: 10, fontFamily: "'Barlow Condensed', sans-serif" }}>
        {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />} Logged Games ({games.length})
      </button>
      {expanded && (
        <div style={{ background: "#fff", borderRadius: 12, padding: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
          {games.slice().reverse().map((g) => {
            const isOpen = viewingGame === g.gameNum;
            return (
              <div key={g.gameNum} style={{ borderBottom: "1px solid #E7E7E7" }}>
                <div onClick={() => setViewingGame(isOpen ? null : g.gameNum)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 4px", fontSize: 13.5, cursor: "pointer" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {isOpen ? <ChevronDown size={14} color="#B0B5BC" /> : <ChevronRight size={14} color="#B0B5BC" />}
                    <b>Game {g.gameNum}</b> · {g.date} · {g.opponent}
                    {g.gameType && g.gameType !== "Regular Season" && (
                      <span style={{
                        fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em",
                        color: "#fff", background: GAME_TYPE_COLOR[g.gameType] || "#000", borderRadius: 999, padding: "2px 8px"
                      }}>{g.gameType}</span>
                    )}
                  </span>
                  <button onClick={(e) => { e.stopPropagation(); onDelete(g.gameNum); }} style={{ background: "none", border: "none", color: "#000", cursor: "pointer" }}><Trash2 size={15} /></button>
                </div>
                {isOpen && (
                  <div style={{ overflowX: "auto", padding: "4px 4px 14px 26px" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, minWidth: 560 }}>
                      <thead>
                        <tr style={{ textAlign: "left", color: "#8A8F98", fontSize: 10.5, textTransform: "uppercase" }}>
                          <th style={{ padding: "4px 6px" }}>Player</th>
                          {[1,2,3,4,5,6,7].map((n) => <th key={n} style={{ padding: "4px 4px", textAlign: "center" }}>I{n}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {roster.map((p) => {
                          const entry = g.players && g.players[p.name];
                          const positions = (entry && entry.positions) || [];
                          const played = positions.some((v) => !!v);
                          return (
                            <tr key={p.name} style={{ borderTop: "1px solid #F0F0F0" }}>
                              <td style={{ padding: "4px 6px", fontWeight: 600, whiteSpace: "nowrap" }}>{p.jersey} {p.name}</td>
                              {!played ? (
                                <td colSpan={7} style={{ padding: "4px 6px", textAlign: "center", color: "#B0B5BC", fontStyle: "italic" }}>Absent</td>
                              ) : positions.map((pos, i) => (
                                <td key={i} style={{ padding: "3px 3px", textAlign: "center" }}>
                                  {pos ? <span style={{ color: pos === "SIT" ? "#8A8F98" : (POS_COLOR[pos] || "#000"), fontWeight: 700 }}>{pos}</span> : ""}
                                </td>
                              ))}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      </div>
    </div>
  );
}

const arrowBtnStyle = { background: "none", border: "none", cursor: "pointer", color: "#B0B5BC", padding: 0, lineHeight: 0.6 };
const ghostBtnStyle = { display: "flex", alignItems: "center", gap: 6, background: "none", color: NAVY, border: "1px solid #D5D5D5", borderRadius: 8, padding: "8px 14px", fontWeight: 600, cursor: "pointer", fontSize: 13, fontFamily: "'Barlow Condensed', sans-serif" };

const labelStyle = { display: "block", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "#8A8F98", fontWeight: 600, marginBottom: 4 };
const inputStyle = { padding: "8px 10px", borderRadius: 7, border: "1px solid #D5D5D5", fontSize: 14, width: "100%", fontFamily: "inherit", boxSizing: "border-box" };
const primaryBtnStyle = { display: "flex", alignItems: "center", gap: 6, background: NAVY, color: "#fff", border: "none", borderRadius: 8, padding: "9px 16px", fontWeight: 600, cursor: "pointer", fontSize: 13.5, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.03em" };

/* ======================== BATTING TAB ======================== */

function BattingTab({ batting, roster, onSave }) {
  const orderedSeed = useMemo(() => {
    const byName = Object.fromEntries(batting.map((b) => [b.name, b]));
    return roster.map((p) => byName[p.name] || blankBattingRow(p));
  }, [batting, roster]);
  const [rows, setRows] = useState(orderedSeed);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [importMsg, setImportMsg] = useState("");
  const fileInputRef = React.useRef(null);
  useEffect(() => setRows(orderedSeed), [orderedSeed]);

  function update(name, field, value) {
    setRows((rs) => rs.map((r) => (r.name === name ? { ...r, [field]: value === "" ? "" : Number(value) } : r)));
  }

  async function handleSave() {
    setSaving(true);
    const ok = await onSave(rows);
    setSaving(false);
    setMsg(ok ? "Batting stats saved." : "Couldn't save — try again.");
    setTimeout(() => setMsg(""), 3000);
  }

  function handleImportClick() {
    setImportMsg("");
    fileInputRef.current && fileInputRef.current.click();
  }

  function handleFileChange(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const { results, error } = parseGameChangerCSV(String(reader.result));
      if (error) { setImportMsg(error); return; }
      const byJersey = Object.fromEntries(results.map((r) => [r.jersey, r]));
      let matched = 0;
      setRows((rs) => rs.map((r) => {
        const found = byJersey[r.jersey];
        if (!found) return r;
        matched += 1;
        return { ...r, GP: found.GP, AB: found.AB, H: found.H, "1B": found["1B"], "2B": found["2B"], "3B": found["3B"], HR: found.HR, RBI: found.RBI, R: found.R, SO: found.SO, FC: found.FC };
      }));
      setImportMsg(`Imported stats for ${matched} of ${results.length} players from the file. Review below, then click Save.`);
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  const calc = computeBatting(rows);
  const fields = ["GP", "AB", "H", "1B", "2B", "3B", "HR", "RBI", "R", "SO", "FC"];

  return (
    <div>
      <SectionHeading icon={TrendingUp}>Batting Stats</SectionHeading>
      <div style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", overflowX: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
          <div style={{ fontSize: 12.5, color: "#8A8F98", maxWidth: 480 }}>Enter season totals from your GameChanger export, or import the CSV directly below. AVG / OBP / SLG / OPS calculate automatically.</div>
          <div>
            <button onClick={handleImportClick} style={ghostBtnStyle}><PlusCircle size={14} /> Import GameChanger CSV</button>
            <input ref={fileInputRef} type="file" accept=".csv" style={{ display: "none" }} onChange={handleFileChange} />
          </div>
        </div>
        {importMsg && <div style={{ fontSize: 12.5, color: importMsg.startsWith("Imported") ? GREENOK : "#000", background: PAPER, borderRadius: 8, padding: "8px 12px", marginBottom: 12 }}>{importMsg}</div>}
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5, minWidth: 880 }}>
          <thead>
            <tr style={{ textAlign: "center", color: "#8A8F98", fontSize: 10.5, textTransform: "uppercase" }}>
              <th style={{ padding: "5px 6px", textAlign: "left" }}>Player</th>
              {fields.map((f) => <th key={f} style={{ padding: "5px 4px" }}>{f}</th>)}
              <th style={{ padding: "5px 4px" }}>AVG</th><th style={{ padding: "5px 4px" }}>OBP</th><th style={{ padding: "5px 4px" }}>SLG</th><th style={{ padding: "5px 4px" }}>OPS</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const c = calc.find((x) => x.name === r.name);
              return (
                <tr key={r.name} style={{ borderTop: "1px solid #E7E7E7" }}>
                  <td style={{ padding: "5px 6px", fontWeight: 600, whiteSpace: "nowrap" }}>{r.jersey} {r.name}</td>
                  {fields.map((f) => (
                    <td key={f} style={{ padding: "3px" }}>
                      <input type="number" value={r[f] || 0} onChange={(e) => update(r.name, f, e.target.value)}
                        style={{ width: 42, padding: "3px 2px", borderRadius: 5, border: "1px solid #D5D5D5", fontSize: 12, textAlign: "center" }} />
                    </td>
                  ))}
                  <td style={{ padding: "5px 4px", textAlign: "center", fontWeight: 700, color: NAVY }}>{fmtAvg(c.AVG)}</td>
                  <td style={{ padding: "5px 4px", textAlign: "center" }}>{fmtAvg(c.OBP)}</td>
                  <td style={{ padding: "5px 4px", textAlign: "center" }}>{fmtAvg(c.SLG)}</td>
                  <td style={{ padding: "5px 4px", textAlign: "center" }}>{fmtAvg(c.OPS)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 16 }}>
          <button onClick={handleSave} disabled={saving} style={primaryBtnStyle}>
            {saving ? <Loader2 size={15} /> : <Save size={15} />} Save Batting Stats
          </button>
          {msg && <span style={{ fontSize: 13, color: msg.includes("saved") ? GREENOK : RED }}>{msg}</span>}
        </div>
      </div>
    </div>
  );
}

/* ======================== REPORTS TAB ======================== */

function ReportsTab({ games, batting, roster }) {
  const [selectedName, setSelectedName] = useState(roster[0].name);
  const player = roster.find((p) => p.name === selectedName) || roster[0];
  const { rows: fielding } = useMemo(() => computeFielding(games, roster), [games, roster]);
  const r = fielding[selectedName];
  const battingRow = batting.find((b) => b.name === selectedName);
  const b = battingRow ? computeBatting([battingRow])[0] : null;
  const gameLog = games.map((g) => {
    const entry = g.players[selectedName];
    const positions = (entry && entry.positions) || [];
    return { ...g, positions, played: positions.some((v) => !!v) };
  });
  const pieData = [
    { name: "Infield", value: r.if, color: INF_BLUE },
    { name: "Outfield", value: r.of, color: FIELD_GREEN },
    { name: "Bench", value: r.sit, color: SIT_GRAY },
  ].filter((d) => d.value > 0);

  return (
    <div>
      <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
        <SectionHeading icon={FileText}>Player Report</SectionHeading>
        <div style={{ display: "flex", gap: 10 }}>
          <select value={selectedName} onChange={(e) => setSelectedName(e.target.value)} style={{ ...inputStyle, width: 200 }}>
            {roster.map((p) => <option key={p.name} value={p.name}>{p.name}</option>)}
          </select>
          <button onClick={() => window.print()} style={primaryBtnStyle}><Printer size={15} /> Print / Save as PDF</button>
        </div>
      </div>

      <div id="print-area" style={{ background: "#fff", borderRadius: 12, padding: 30, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", maxWidth: 780, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `3px solid ${GOLD}`, paddingBottom: 16, marginBottom: 20 }}>
          <div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", color: GOLD, fontWeight: 700, letterSpacing: "0.1em", fontSize: 12 }}>KITCHENER PANTHERS · 2026 U8 TIER 1</div>
            <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 32, color: NAVY, fontWeight: 700 }}>{player.name}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 26, color: NAVY, fontWeight: 700 }}>{player.jersey}</div>
            <div style={{ fontSize: 11, color: "#8A8F98" }}>{games.length} games this season</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 22 }}>
          {b && [["AVG", fmtAvg(b.AVG)], ["OBP", fmtAvg(b.OBP)], ["OPS", fmtAvg(b.OPS)], ["SLG", fmtAvg(b.SLG)], ["H", b.H], ["RBI", b.RBI], ["R", b.R]].map(([k, v]) => (
            <div key={k} style={{ background: PAPER, borderRadius: 8, padding: "10px 14px", minWidth: 60, textAlign: "center", flex: "1 1 60px" }}>
              <div style={{ fontSize: 10, color: "#8A8F98", textTransform: "uppercase", fontWeight: 700 }}>{k}</div>
              <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 19, color: NAVY, fontWeight: 600 }}>{v}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginBottom: 22 }}>
          <div style={{ flex: "1 1 220px" }}>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: "#8A8F98", marginBottom: 6, fontWeight: 700 }}>Fielding Split</div>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={38} outerRadius={62} paddingAngle={2}>
                  {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip />
                <Legend iconSize={9} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ flex: "1 1 220px" }}>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: "#8A8F98", marginBottom: 6, fontWeight: 700 }}>Season Balance</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
              <div>Infield innings: <b>{r.if}</b></div>
              <div>Outfield innings: <b>{r.of}</b></div>
              <div>Bench innings: <b>{r.sit}</b></div>
              <div style={{ marginTop: 4 }}><BalanceChip dev={r.deviation} balance={r.balance} /></div>
            </div>
          </div>
        </div>

        <div>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: "#8A8F98", marginBottom: 8, fontWeight: 700 }}>Full Game Log</div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11.5 }}>
            <thead>
              <tr style={{ textAlign: "left", color: "#8A8F98", fontSize: 10, textTransform: "uppercase" }}>
                <th style={{ padding: "4px 5px" }}>#</th><th style={{ padding: "4px 5px" }}>Date</th><th style={{ padding: "4px 5px" }}>Opponent</th>
                {[1,2,3,4,5,6,7].map((n) => <th key={n} style={{ padding: "4px 4px", textAlign: "center" }}>I{n}</th>)}
              </tr>
            </thead>
            <tbody>
              {gameLog.map((g) => (
                <tr key={g.gameNum} style={{ borderTop: "1px solid #E7E7E7" }}>
                  <td style={{ padding: "4px 5px", color: "#8A8F98" }}>{g.gameNum}</td>
                  <td style={{ padding: "4px 5px" }}>{g.date}</td>
                  <td style={{ padding: "4px 5px" }}>{g.opponent}</td>
                  {!g.played ? (
                    <td colSpan={7} style={{ padding: "4px 5px", textAlign: "center", color: "#B0B5BC", fontStyle: "italic" }}>Absent</td>
                  ) : g.positions.map((pos, i) => (
                    <td key={i} style={{ padding: "3px 3px", textAlign: "center" }}>
                      {pos ? <span style={{ color: pos === "SIT" ? "#8A8F98" : POS_COLOR[pos], fontWeight: 700 }}>{pos}</span> : ""}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: 24, textAlign: "center", fontSize: 10.5, color: "#B0B5BC" }}>Kitchener Panthers · Head Coach Jay Mielke · Generated from the 2026 season tracker</div>
      </div>
    </div>
  );
}

/* ======================== APP SHELL ======================== */

const TABS = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "players", label: "Players", icon: Users },
  { key: "addgame", label: "Add Game", icon: PlusCircle },
  { key: "batting", label: "Batting", icon: TrendingUp },
  { key: "mvp", label: "MVP", icon: Trophy },
  { key: "reports", label: "Reports", icon: FileText },
];

async function seedDatabase() {
  try {
    const playerRows = ROSTER_SEED.map((p, i) => ({ jersey: p.jersey, name: p.name, sort_order: i }));
    const { error: pErr } = await supabase.from("players").insert(playerRows);
    if (pErr) throw pErr;
    const battingRows = SEED_BATTING.map(battingRowToDb);
    const { error: bErr } = await supabase.from("batting_stats").insert(battingRows);
    if (bErr) throw bErr;
    const gameRows = SEED_GAMES.map((g) => ({ game_num: g.gameNum, date: g.date, opponent: g.opponent, game_type: g.gameType || "Regular Season", players: g.players }));
    const { error: gErr } = await supabase.from("games").insert(gameRows);
    if (gErr) throw gErr;
    return true;
  } catch (e) { console.error(e); return false; }
}

export default function App({ onSignOut }) {
  const [tab, setTab] = useState("dashboard");
  const [games, setGames] = useState(null);
  const [batting, setBatting] = useState(null);
  const [roster, setRoster] = useState(null);
  const [mvpAwards, setMvpAwards] = useState(null);
  const [navOpen, setNavOpen] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const refresh = useCallback(() => {
    loadData().then(({ games, batting, roster, mvpAwards }) => { setGames(games); setBatting(batting); setRoster(roster); setMvpAwards(mvpAwards); });
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const handleSaveGames = useCallback(async (updated) => {
    const ok = await saveGames(updated);
    if (ok) setGames(updated);
    return ok;
  }, []);

  const handleDeleteGame = useCallback(async (gameNum) => {
    const ok = await deleteGameRow(gameNum);
    if (ok) setGames((gs) => gs.filter((g) => g.gameNum !== gameNum));
  }, []);

  const handleSaveBatting = useCallback(async (updated) => {
    const ok = await saveBatting(updated);
    if (ok) setBatting(updated);
    return ok;
  }, []);

  const handleAddPlayer = useCallback(async (newPlayer) => {
    const added = await addPlayerRow(newPlayer, roster.length);
    if (!added) return;
    setRoster((r) => [...r, added]);
    const nb = [...batting, blankBattingRow(newPlayer)];
    await saveBatting(nb);
    setBatting(nb);
  }, [roster, batting]);

  const handleReorderRoster = useCallback(async (newRoster) => {
    setRoster(newRoster);
    await saveRosterOrder(newRoster);
  }, []);

  const handleUploadPhoto = useCallback(async (playerId, file) => {
    const result = await uploadPlayerPhoto(playerId, file);
    if (result.url) setRoster((r) => r.map((p) => (p.id === playerId ? { ...p, photoUrl: result.url } : p)));
    return result;
  }, []);

  const handleAwardMvp = useCallback(async (award) => {
    const ok = await saveMvpAward(award);
    if (ok) refresh();
    return ok;
  }, [refresh]);

  const handleRemoveMvpAward = useCallback(async (id) => {
    const ok = await deleteMvpAward(id);
    if (ok) setMvpAwards((a) => a.filter((x) => x.id !== id));
  }, []);

  const handleSeed = useCallback(async () => {
    setSeeding(true);
    await seedDatabase();
    setSeeding(false);
    refresh();
  }, [refresh]);

  if (!games || !batting || !roster || !mvpAwards) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300, fontFamily: "'Barlow Condensed', sans-serif", color: NAVY }}>
        <Loader2 className="spin" size={20} style={{ marginRight: 8 }} /> Loading season data…
      </div>
    );
  }

  if (roster.length === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "80vh", fontFamily: "'Inter', sans-serif", gap: 14, padding: 20, textAlign: "center" }}>
        <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 22, color: NAVY }}>No data yet in this database</div>
        <div style={{ color: "#8A8F98", maxWidth: 420 }}>Load the 2026 season starter data (roster, 17 games, batting stats) to get going, or start from a blank roster in the Add Game tab.</div>
        <button onClick={handleSeed} disabled={seeding} style={primaryBtnStyle}>
          {seeding ? <Loader2 size={15} className="spin" /> : <PlusCircle size={15} />} Load Starter Season Data
        </button>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: PAPER, minHeight: "100vh", color: INK }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Barlow+Condensed:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        button:focus-visible, select:focus-visible, input:focus-visible { outline: 2px solid ${GOLD}; outline-offset: 1px; }
        @media print {
          .no-print { display: none !important; }
          body, #print-root { background: #fff !important; }
        }
        @media (max-width: 720px) {
          .nav-desktop { display: none !important; }
          .nav-mobile { display: flex !important; }
        }
      `}</style>

      <div className="no-print" style={{ background: NAVY_DEEP, padding: "0 20px", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
          <div style={{ color: "#fff", fontFamily: "'Oswald', sans-serif", fontWeight: 700, fontSize: 17, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: 999, background: GOLD, display: "inline-block" }} /> PANTHERS TRACKER
          </div>
          <nav className="nav-desktop" style={{ display: "flex", gap: 4 }}>
            {TABS.map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)} style={{
                display: "flex", alignItems: "center", gap: 6, background: tab === t.key ? "rgba(255,255,255,0.12)" : "transparent",
                border: "none", color: tab === t.key ? GOLD : "#C9CFD8", padding: "8px 14px", borderRadius: 8, cursor: "pointer",
                fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontSize: 14, letterSpacing: "0.02em"
              }}>
                <t.icon size={15} /> {t.label}
              </button>
            ))}
            <button onClick={onSignOut} title="Sign out" style={{ background: "transparent", border: "none", color: "#7C8494", padding: "8px 10px", cursor: "pointer" }}>
              <X size={15} />
            </button>
          </nav>
          <button className="nav-mobile" style={{ display: "none", background: "none", border: "none", color: "#fff" }} onClick={() => setNavOpen((o) => !o)}>
            {navOpen ? <X size={22} /> : <LayoutDashboard size={22} />}
          </button>
        </div>
        {navOpen && (
          <div className="nav-mobile" style={{ display: "flex", flexDirection: "column", paddingBottom: 10, gap: 2 }}>
            {TABS.map((t) => (
              <button key={t.key} onClick={() => { setTab(t.key); setNavOpen(false); }} style={{
                display: "flex", alignItems: "center", gap: 8, background: tab === t.key ? "rgba(255,255,255,0.12)" : "transparent",
                border: "none", color: tab === t.key ? GOLD : "#C9CFD8", padding: "10px 12px", borderRadius: 8, cursor: "pointer",
                fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontSize: 15, textAlign: "left"
              }}>
                <t.icon size={16} /> {t.label}
              </button>
            ))}
            <button onClick={onSignOut} style={{ display: "flex", alignItems: "center", gap: 8, background: "transparent", border: "none", color: "#7C8494", padding: "10px 12px", cursor: "pointer", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontSize: 15, textAlign: "left" }}>
              <X size={16} /> Sign Out
            </button>
          </div>
        )}
      </div>

      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "22px 18px 60px" }}>
        {tab === "dashboard" && <DashboardTab games={games} batting={batting} roster={roster} />}
        {tab === "players" && <PlayersTab games={games} batting={batting} roster={roster} onUploadPhoto={handleUploadPhoto} />}
        {tab === "addgame" && <AddGameTab games={games} roster={roster} onSave={handleSaveGames} onDelete={handleDeleteGame} onAddPlayer={handleAddPlayer} onReorderRoster={handleReorderRoster} />}
        {tab === "batting" && <BattingTab batting={batting} roster={roster} onSave={handleSaveBatting} />}
        {tab === "mvp" && <MvpTab games={games} roster={roster} mvpAwards={mvpAwards} onAward={handleAwardMvp} onRemoveAward={handleRemoveMvpAward} />}
        {tab === "reports" && <ReportsTab games={games} batting={batting} roster={roster} />}
      </div>
    </div>
  );
}
