

var pm=TVShell.PrintManager;
var PEN_BLACK=1;
var PEN_COLOR=2;

var PHOTO_PRINT_TRUE = true;
var PHOTO_PRINT_FALSE = false;


function InitializePrinterModelList()
{
	var epsondll ="epsonstylus.dll";
	var hpdll = "hppcl.dll";
	var unsupported = "unsupported";

	pm.DestroyModelList();
	pm.AddModel("HP","Apollo P2100 ",hpdll,PEN_BLACK, PHOTO_PRINT_FALSE); 
	pm.AddModel("HP","Apollo P2150 ",hpdll,PEN_BLACK, PHOTO_PRINT_FALSE);  
	pm.AddModel("HP","Apollo P2200 ",hpdll,PEN_BLACK, PHOTO_PRINT_FALSE); 
	pm.AddModel("HP","Apollo P2250 ",hpdll,PEN_BLACK, PHOTO_PRINT_FALSE);
//	pm.AddModel("HP","DeskJet 350",hpdll,PEN_COLOR, PHOTO_PRINT_FALSE); // no USB port
//	pm.AddModel("HP","DeskJet 350cbi",hpdll,PEN_COLOR, PHOTO_PRINT_FALSE); // no USB port		
//	pm.AddModel("HP","DeskJet 400",hpdll,PEN_COLOR, PHOTO_PRINT_FALSE); // no USB port
//	pm.AddModel("HP","DeskJet 400i",hpdll,PEN_COLOR, PHOTO_PRINT_FALSE); // no USB port
	pm.AddModel("HP","DJ450",hpdll,PEN_COLOR, PHOTO_PRINT_FALSE); //450cbi,450ci,45wbt mobil printers
//	pm.AddModel("HP","DeskJet 540",hpdll,PEN_COLOR, PHOTO_PRINT_FALSE); // no USB port
//	pm.AddModel("HP","DeskJet 600",hpdll,PEN_COLOR, PHOTO_PRINT_FALSE); // no USB port
//	pm.AddModel("HP","DeskJet 600c",hpdll,PEN_COLOR, PHOTO_PRINT_FALSE); // no USB port
//	pm.AddModel("HP","DeskJet 600k",hpdll,PEN_COLOR, PHOTO_PRINT_FALSE); // no USB port
	pm.AddModel("HP","DeskJet 610C",hpdll,PEN_COLOR, PHOTO_PRINT_FALSE);
	pm.AddModel("HP","DeskJet 612C",hpdll,PEN_COLOR, PHOTO_PRINT_FALSE);
	pm.AddModel("HP","DeskJet 630C",hpdll,PEN_COLOR, PHOTO_PRINT_FALSE);
	pm.AddModel("HP","DeskJet 632C",hpdll,PEN_COLOR, PHOTO_PRINT_FALSE);
//	pm.AddModel("HP","DeskJet 660C",hpdll,PEN_COLOR, PHOTO_PRINT_FALSE);	// no USB port
//	pm.AddModel("HP","DeskJet 660cse",hpdll,PEN_COLOR, PHOTO_PRINT_FALSE);// no USB port
//	pm.AddModel("HP","DeskJet 660k",hpdll,PEN_COLOR, PHOTO_PRINT_FALSE);	// no USB port
//	pm.AddModel("HP","DeskJet 690c",hpdll,PEN_COLOR, PHOTO_PRINT_FALSE);	// no USB port
	pm.AddModel("HP","DeskJet 648C",hpdll,PEN_COLOR, PHOTO_PRINT_FALSE);
	pm.AddModel("HP","DeskJet 656",hpdll,PEN_COLOR, PHOTO_PRINT_FALSE);
	pm.AddModel("HP","DeskJet 810C",hpdll,PEN_COLOR, PHOTO_PRINT_FALSE);
	pm.AddModel("HP","DeskJet 812C",hpdll,PEN_COLOR, PHOTO_PRINT_FALSE);
	pm.AddModel("HP","DeskJet 815C",hpdll,PEN_COLOR, PHOTO_PRINT_FALSE);
	pm.AddModel("HP","DeskJet 816C",hpdll,PEN_COLOR, PHOTO_PRINT_FALSE);
	pm.AddModel("HP","DeskJet 825",hpdll,PEN_COLOR, PHOTO_PRINT_FALSE);
	pm.AddModel("HP","DeskJet 842C",hpdll,PEN_COLOR, PHOTO_PRINT_FALSE);
	pm.AddModel("HP","DeskJet 845",hpdll,PEN_COLOR, PHOTO_PRINT_FALSE);	
	pm.AddModel("HP","DeskJet 850c",hpdll,PEN_COLOR, PHOTO_PRINT_FALSE);	
	pm.AddModel("HP","DeskJet 850k",hpdll,PEN_COLOR, PHOTO_PRINT_FALSE);
	pm.AddModel("HP","DeskJet 890c",hpdll,PEN_COLOR, PHOTO_PRINT_FALSE);	
	pm.AddModel("HP","DeskJet 890k",hpdll,PEN_COLOR, PHOTO_PRINT_FALSE);
	pm.AddModel("HP","DeskJet 895cse",hpdll,PEN_COLOR, PHOTO_PRINT_FALSE);	
	pm.AddModel("HP","DeskJet 895cxi",hpdll,PEN_COLOR, PHOTO_PRINT_FALSE);
	pm.AddModel("HP","DeskJet 920",hpdll,PEN_COLOR, PHOTO_PRINT_FALSE);
	pm.AddModel("HP","DeskJet 932C",hpdll,PEN_COLOR, PHOTO_PRINT_FALSE);
	pm.AddModel("HP","DeskJet 935C",hpdll,PEN_COLOR, PHOTO_PRINT_FALSE);
	pm.AddModel("HP","DeskJet 940",hpdll,PEN_COLOR, PHOTO_PRINT_FALSE);
	pm.AddModel("HP","DeskJet 948",hpdll,PEN_COLOR, PHOTO_PRINT_FALSE);
	pm.AddModel("HP","DeskJet 952C",hpdll,PEN_COLOR, PHOTO_PRINT_FALSE);
	pm.AddModel("HP","DeskJet 970cse",hpdll,PEN_COLOR, PHOTO_PRINT_FALSE);	
	pm.AddModel("HP","DeskJet 970cxi",hpdll,PEN_COLOR, PHOTO_PRINT_FALSE);
	pm.AddModel("HP","DeskJet 980",hpdll,PEN_COLOR, PHOTO_PRINT_FALSE);
	pm.AddModel("HP","DeskJet 990C",hpdll,PEN_COLOR, PHOTO_PRINT_FALSE);
	pm.AddModel("HP","DeskJet 995",hpdll,PEN_COLOR, PHOTO_PRINT_FALSE);
	pm.AddModel("HP","DeskJet 1125C",hpdll,PEN_COLOR, PHOTO_PRINT_FALSE);
	pm.AddModel("HP","DeskJet 1220C",hpdll,PEN_COLOR, PHOTO_PRINT_FALSE);
	pm.AddModel("HP","DeskJet 3816",hpdll,PEN_COLOR, PHOTO_PRINT_FALSE);
	pm.AddModel("HP","DeskJet 3820",hpdll,PEN_COLOR, PHOTO_PRINT_FALSE);	
	pm.AddModel("HP","DeskJet 5100",hpdll,PEN_COLOR, PHOTO_PRINT_FALSE); //support 5150, 5158, 5160
	pm.AddModel("HP","DeskJet 5550",hpdll,PEN_COLOR, PHOTO_PRINT_FALSE); 
	pm.AddModel("HP","DeskJet 5551",hpdll,PEN_COLOR, PHOTO_PRINT_FALSE); 
	pm.AddModel("HP","DeskJet 5600",hpdll,PEN_COLOR, PHOTO_PRINT_FALSE); //5650, 5670
	pm.AddModel("HP","DeskJet 5800",hpdll,PEN_COLOR, PHOTO_PRINT_FALSE); //5800 series include 5850
	pm.AddModel("HP","DeskJet 6122",hpdll,PEN_COLOR, PHOTO_PRINT_FALSE);
	pm.AddModel("HP","DeskJet 6127",hpdll,PEN_COLOR, PHOTO_PRINT_FALSE);	
	pm.AddModel("HP","DeskJet 9300",hpdll,PEN_COLOR, PHOTO_PRINT_FALSE);
	pm.AddModel("HP","DeskJet 9600",hpdll,PEN_COLOR, PHOTO_PRINT_FALSE);	

	pm.AddModel("HP","DeskJet CP1160",hpdll,PEN_COLOR, PHOTO_PRINT_FALSE);	
	pm.AddModel("HP","DeskJet CP1700",hpdll,PEN_COLOR, PHOTO_PRINT_FALSE);

	pm.AddModel("HP","Laserjet 1200",hpdll,PEN_BLACK, PHOTO_PRINT_FALSE);
	pm.AddModel("HP","Laserjet 1300",hpdll,PEN_BLACK, PHOTO_PRINT_FALSE);
	pm.AddModel("HP","Laserjet 2200",hpdll,PEN_BLACK, PHOTO_PRINT_FALSE);
	pm.AddModel("HP","Laserjet 4100",hpdll,PEN_BLACK, PHOTO_PRINT_FALSE);
	pm.AddModel("HP","Laserjet 4200",hpdll,PEN_BLACK, PHOTO_PRINT_FALSE);
	pm.AddModel("HP","Laserjet 4300",hpdll,PEN_BLACK, PHOTO_PRINT_FALSE);
	pm.AddModel("HP","Laserjet 2300",hpdll,PEN_BLACK, PHOTO_PRINT_FALSE); 
	
	pm.AddModel("HP","Color LaserJet 2500",hpdll,PEN_COLOR, PHOTO_PRINT_FALSE);
	pm.AddModel("HP","Color LaserJet 3500",hpdll,PEN_COLOR, PHOTO_PRINT_FALSE);
	pm.AddModel("HP","Color LaserJet 4550",hpdll,PEN_COLOR, PHOTO_PRINT_FALSE);
	pm.AddModel("HP","Color LaserJet 4600",hpdll,PEN_COLOR, PHOTO_PRINT_FALSE);
	pm.AddModel("HP","Color LaserJet 5500",hpdll,PEN_COLOR, PHOTO_PRINT_FALSE);
	
	pm.AddModel("HP","Deskjet PhotoSmart PS100",hpdll,PEN_COLOR, PHOTO_PRINT_FALSE);
	pm.AddModel("HP","Deskjet PhotoSmart PS130",hpdll,PEN_COLOR, PHOTO_PRINT_FALSE);
	pm.AddModel("HP","Deskjet PhotoSmart PS140",hpdll,PEN_COLOR, PHOTO_PRINT_FALSE);
	pm.AddModel("HP","Deskjet PhotoSmart PS230",hpdll,PEN_COLOR, PHOTO_PRINT_FALSE);
	pm.AddModel("HP","Deskjet PhotoSmart PS240",hpdll,PEN_COLOR, PHOTO_PRINT_FALSE);
	pm.AddModel("HP","Deskjet PhotoSmart 1000",hpdll,PEN_COLOR, PHOTO_PRINT_FALSE);
	pm.AddModel("HP","Deskjet PhotoSmart 1100",hpdll,PEN_COLOR, PHOTO_PRINT_FALSE);
	pm.AddModel("HP","Deskjet PhotoSmart P2500",hpdll,PEN_COLOR, PHOTO_PRINT_FALSE);
	pm.AddModel("HP","Deskjet PhotoSmart P2600",hpdll,PEN_COLOR, PHOTO_PRINT_FALSE); 

	pm.AddModel("HP","Deskjet PhotoSmart PS1115",hpdll,PEN_COLOR, PHOTO_PRINT_FALSE);
	pm.AddModel("HP","Deskjet PhotoSmart PS1215",hpdll,PEN_COLOR, PHOTO_PRINT_FALSE);
	pm.AddModel("HP","Deskjet PhotoSmart PS12818",hpdll,PEN_COLOR, PHOTO_PRINT_FALSE);
	pm.AddModel("HP","Deskjet PhotoSmart PS1315",hpdll,PEN_COLOR, PHOTO_PRINT_FALSE);

	pm.AddModel("HP","Deskjet PhotoSmart PS7150",hpdll,PEN_COLOR, PHOTO_PRINT_FALSE);
	pm.AddModel("HP","Deskjet PhotoSmart PS7260",hpdll,PEN_COLOR, PHOTO_PRINT_FALSE);
	pm.AddModel("HP","Deskjet PhotoSmart PS7268",hpdll,PEN_COLOR, PHOTO_PRINT_FALSE);
	pm.AddModel("HP","Deskjet PhotoSmart PS7350",hpdll,PEN_COLOR, PHOTO_PRINT_FALSE);
	pm.AddModel("HP","Deskjet PhotoSmart PS7550",hpdll,PEN_COLOR, PHOTO_PRINT_FALSE);
	pm.AddModel("HP","Deskjet PhotoSmart PS7660",hpdll,PEN_COLOR, PHOTO_PRINT_FALSE);
	pm.AddModel("HP","Deskjet PhotoSmart PS7760",hpdll,PEN_COLOR, PHOTO_PRINT_FALSE);
	pm.AddModel("HP","Deskjet PhotoSmart PS7960",hpdll,PEN_COLOR, PHOTO_PRINT_FALSE);
	pm.AddModel("HP","Photosmart 8100 series",hpdll,PEN_COLOR, PHOTO_PRINT_TRUE);
	pm.AddModel("HP","Photosmart 8400 series",hpdll,PEN_COLOR, PHOTO_PRINT_TRUE);

    pm.AddModel("Epson","Stylus C20UX",epsondll,PEN_COLOR, PHOTO_PRINT_FALSE);
    pm.AddModel("Epson","Stylus C20SX",epsondll,PEN_COLOR, PHOTO_PRINT_FALSE);
    pm.AddModel("Epson","Stylus C40UX",epsondll,PEN_COLOR, PHOTO_PRINT_FALSE);
    pm.AddModel("Epson","Stylus C40S",epsondll,PEN_COLOR, PHOTO_PRINT_FALSE);
    pm.AddModel("Epson","Stylus C40SX",epsondll,PEN_COLOR, PHOTO_PRINT_FALSE);
    pm.AddModel("Epson","Stylus C41Plus",epsondll,PEN_COLOR, PHOTO_PRINT_FALSE);
    pm.AddModel("Epson","Stylus C41SX",epsondll,PEN_COLOR, PHOTO_PRINT_FALSE);
    pm.AddModel("Epson","Stylus C41UX",epsondll,PEN_COLOR, PHOTO_PRINT_FALSE);
    pm.AddModel("Epson","Stylus C42S",epsondll,PEN_COLOR, PHOTO_PRINT_FALSE);
    pm.AddModel("Epson","Stylus C42SX",epsondll,PEN_COLOR, PHOTO_PRINT_FALSE);
    pm.AddModel("Epson","Stylus C42Plus",epsondll,PEN_COLOR, PHOTO_PRINT_FALSE);
    pm.AddModel("Epson","Stylus C42UX",epsondll,PEN_COLOR, PHOTO_PRINT_FALSE);
    pm.AddModel("Epson","Stylus C43SX",epsondll,PEN_COLOR, PHOTO_PRINT_FALSE);
    pm.AddModel("Epson","Stylus C43UX",epsondll,PEN_COLOR, PHOTO_PRINT_FALSE);
    pm.AddModel("Epson","Stylus C44Plus",epsondll,PEN_COLOR, PHOTO_PRINT_FALSE);
    pm.AddModel("Epson","Stylus C44",epsondll,PEN_COLOR, PHOTO_PRINT_FALSE);
    pm.AddModel("Epson","Stylus C60",epsondll,PEN_COLOR, PHOTO_PRINT_FALSE);
    pm.AddModel("Epson","Stylus C61",epsondll,PEN_COLOR, PHOTO_PRINT_FALSE);
    pm.AddModel("Epson","Stylus C62",epsondll,PEN_COLOR, PHOTO_PRINT_FALSE);	
    pm.AddModel("Epson","Stylus C64",epsondll,PEN_COLOR, PHOTO_PRINT_FALSE);	
    pm.AddModel("Epson","Stylus C80",epsondll,PEN_COLOR, PHOTO_PRINT_FALSE);
    pm.AddModel("Epson","Stylus C82",epsondll,PEN_COLOR, PHOTO_PRINT_FALSE);
    pm.AddModel("Epson","Stylus C83",epsondll,PEN_COLOR, PHOTO_PRINT_FALSE);
    pm.AddModel("Epson","Stylus C84",epsondll,PEN_COLOR, PHOTO_PRINT_FALSE);
 //   pm.AddModel("Epson","Stylus COLOR 440",epsondll,PEN_COLOR, PHOTO_PRINT_FALSE);  // no USB port
 //   pm.AddModel("Epson","Stylus COLOR 640",epsondll,PEN_COLOR, PHOTO_PRINT_FALSE);  // no USB port
    pm.AddModel("Epson","Stylus COLOR 670",epsondll,PEN_COLOR, PHOTO_PRINT_FALSE);
    pm.AddModel("Epson","Stylus COLOR 740",epsondll,PEN_COLOR, PHOTO_PRINT_FALSE);
    pm.AddModel("Epson","Stylus COLOR 740i",epsondll,PEN_COLOR, PHOTO_PRINT_FALSE);
    pm.AddModel("Epson","Stylus COLOR 760",epsondll,PEN_COLOR, PHOTO_PRINT_FALSE);
    pm.AddModel("Epson","Stylus COLOR 777",epsondll,PEN_COLOR, PHOTO_PRINT_FALSE);
    pm.AddModel("Epson","Stylus COLOR 777i",epsondll,PEN_COLOR, PHOTO_PRINT_FALSE);
    pm.AddModel("Epson","Stylus Photo 780",epsondll,PEN_COLOR, PHOTO_PRINT_FALSE);
    pm.AddModel("Epson","Stylus Photo 790",epsondll,PEN_COLOR, PHOTO_PRINT_FALSE);
    pm.AddModel("Epson","Stylus Photo 820",epsondll,PEN_COLOR, PHOTO_PRINT_TRUE);
    pm.AddModel("Epson","Stylus Photo 825",epsondll,PEN_COLOR, PHOTO_PRINT_FALSE);
    pm.AddModel("Epson","Stylus Photo 890",epsondll,PEN_COLOR, PHOTO_PRINT_FALSE);
    pm.AddModel("Epson","Stylus Photo 900",epsondll,PEN_COLOR, PHOTO_PRINT_TRUE);
    pm.AddModel("Epson","Stylus Photo 915",epsondll,PEN_COLOR, PHOTO_PRINT_FALSE);
    pm.AddModel("Epson","Stylus Photo 950",epsondll,PEN_COLOR, PHOTO_PRINT_FALSE);
    pm.AddModel("Epson","Stylus Photo 960",epsondll,PEN_COLOR, PHOTO_PRINT_TRUE);
    pm.AddModel("Epson","Stylus Photo 1280",epsondll,PEN_COLOR, PHOTO_PRINT_FALSE);
    pm.AddModel("Epson","Stylus Photo R200",epsondll,PEN_COLOR, PHOTO_PRINT_TRUE);

 // Unsupported HP Printers
	pm.AddModel("HP","DeskJet 3600",unsupported,PEN_COLOR, PHOTO_PRINT_FALSE);
}

