var config = require('config');
var mapModule = require('map');
var plugins = require('./leaflet_plugins');
var polyUtil = require('./polyline_encoded.js');
var routeboxer = require('./leaflet_routeboxer.js');

var dataxt= {"requestParameters":{"bikeBoardCost":"15","walkReluctance":"10","fromPlace":"37.44188,-122.14302","triangleTimeFactor":"0.9","date":"2016-03-17","clampInitialWait":"60","mode":"CAR,WALK,BUSISH,TRAINISH","numItineraries":"3","optimize":"QUICK","triangleSlopeFactor":"0.5","time":"10:00","maxWalkDistance":"20000","toPlace":"37.1192741394043,-121.6375961303711","triangleSafetyFactor":"0.9","bikeSpeed":"10"},"plan":{"date":1458234000000,"from":{"name":"Middlefield Road","lon":-122.14292590869063,"lat":37.44197377706234,"orig":""},"to":{"name":"s","lon":-121.63790196978937,"lat":37.119158729139805,"orig":""},"itineraries":[{"duration":10171,"startTime":1458234345000,"endTime":1458244516000,"walkTime":1485,"transitTime":8459,"waitingTime":227,"walkDistance":1286.880315785398,"walkLimitExceeded":false,"elevationLost":0.0,"elevationGained":0.0,"transfers":1,"fare":{"fare":{"regular":{"currency":{"currency":"USD","currencyCode":"USD","defaultFractionDigits":2,"symbol":"$"},"cents":400}}},"legs":[{"startTime":1458234345000,"endTime":1458234839000,"departureDelay":0,"arrivalDelay":0,"realTime":false,"distance":2733.107,"pathway":false,"mode":"CAR","route":"","agencyTimeZoneOffset":-25200000,"interlineWithPreviousLeg":false,"from":{"name":"Middlefield Road","lon":-122.14292590869063,"lat":37.44197377706234,"departure":1458234345000,"orig":""},"to":{"name":"EL CAMINO & CALIFORNIA","stopId":"VTA:335","stopCode":"60335","lon":-122.145650991,"lat":37.42478741,"arrival":1458234839000,"departure":1458234840000,"zoneId":"1","stopIndex":1,"stopSequence":2},"legGeometry":{"points":"i{ocFh`ohVOVMVDVVxA\\hB|@rEZbBVrAFMHEJ@LDdBbBLLLNpEnELNNLpErENNJJtEtELJLNvEvELLXXDDLLx@x@~A~ABBFDLLlCnC`C`CvAtADDDDJJTXLOjLmN~@iAvJqLfAoAn@s@~AiBvAgBbAgA`AiAdAoA^w@Rc@n@yA`@{@","length":57},"rentedBike":false,"transitLeg":false,"duration":494.0,"steps":[{"distance":27.111,"relativeDirection":"DEPART","streetName":"Middlefield Road","absoluteDirection":"NORTHWEST","stayOn":false,"area":false,"bogusName":false,"lon":-122.14292590869063,"lat":37.44197377706234,"elevation":[]},{"distance":288.371,"relativeDirection":"LEFT","streetName":"Embarcadero Road","absoluteDirection":"WEST","stayOn":false,"area":false,"bogusName":false,"lon":-122.1431661,"lat":37.4421257,"elevation":[]},{"distance":1244.522,"relativeDirection":"LEFT","streetName":"Churchill Avenue","absoluteDirection":"SOUTHEAST","stayOn":false,"area":false,"bogusName":false,"lon":-122.1462424,"lat":37.4412541,"elevation":[]},{"distance":665.319,"relativeDirection":"LEFT","streetName":"El Camino Real","absoluteDirection":"SOUTHEAST","stayOn":false,"area":false,"bogusName":false,"lon":-122.1547563,"lat":37.4324731,"elevation":[]},{"distance":507.784,"relativeDirection":"CONTINUE","streetName":"West El Camino Real","absoluteDirection":"SOUTHEAST","stayOn":false,"area":false,"bogusName":false,"lon":-122.1496667,"lat":37.4280612,"elevation":[]}]},{"startTime":1458234840000,"endTime":1458238485000,"departureDelay":0,"arrivalDelay":0,"realTime":false,"distance":25824.3388783421,"pathway":false,"mode":"BUS","route":"522","agencyName":"VTA","agencyUrl":"http://www.vta.org","agencyTimeZoneOffset":-25200000,"routeType":3,"routeId":"522","interlineWithPreviousLeg":false,"tripBlockId":"b_541","headsign":"522 RAPID EASTRIDGE","agencyId":"VTA","tripId":"1936889","serviceDate":"20160317","from":{"name":"EL CAMINO & CALIFORNIA","stopId":"VTA:335","stopCode":"60335","lon":-122.145650991,"lat":37.42478741,"arrival":1458234839000,"departure":1458234840000,"zoneId":"1","stopIndex":1,"stopSequence":2},"to":{"name":"SANTA CLARA & ALMADEN BLVD","stopId":"VTA:410","stopCode":"60410","lon":-121.894948203,"lat":37.333960133,"arrival":1458238485000,"departure":1458238710000,"zoneId":"1","stopIndex":16,"stopSequence":17},"legGeometry":{"points":"gplcF`qohVhAqC~AkDfBeE`A_CXm@FODM^}@Pe@n@yA@CpA{CBGBGr@cBHUNYJY|AgDFOb@_AZ{@z@{BxBoFRe@Vm@zAmDL[fAiCr@cBJWN_@f@kATe@\\y@x@mBdAeCvAiDz@qBdBoDf@eAHKHQDId@q@|@oAjAyATU\\]f@e@`@]lBsA~HaGNKRQ`@[~BgBbAw@p@m@pAmAp@g@`As@~OgLtAeAfB_BpCeDn@y@LMRW^i@zDyErE{FhAgB`@s@f@_A|AuDHOBKt@eBPe@nAiCbCuFZq@`@cADMVq@Zw@`CeHdD{JvBsGvCyIpBcGdA{ChDyJlAsDPe@n@oB\\_Ah@aA`@o@p@{@h@m@`B{A`AaAPQLKHG|@{@VU|@eAf@w@\\q@|@sBbAeCJWBGFORc@N_@FQHSl@{AHQ`BeEHS`BiEXw@l@wAL[JWDMFMd@mA~@eC|GcQVm@HSBKhAqCVm@jAuC^}@v@sBj@yAn@cB~CcIl@yAh@sAL]`@aAdBkErCmH`BeE`AgCFUFOd@}AX_AZcAFQ@Cz@kCHQ`@qAFQb@yA@EJ[DQDO@A@A@GHW@ELg@p@{BDMH]DMZeADMDQ@ENk@H[DSBGr@kC\\oA`@{ANe@BOV_AJ]Li@Po@Ni@V}@\\oAHW?AZmA\\oAJc@XaAvAiF@Cf@gB\\sAXaAPq@Nk@Vy@v@qC\\_A^mA?ABKv@aCRq@F_@fAsFz@iFz@}EP}@@GbAeGl@gERmBt@iFnCaTRsAZeCFc@nBsLd@qChAoHnBiMDOB[H_@Dq@R}AVqBD]D[ReBJu@@IJq@Li@H[X_AjA_DDKP]HQHSFMHKR[FG`@i@xGeInC{Dd@q@hGmHdEkFbAsA`AsA`@i@FIHMl@eAbAqAz@gAjDiEl@y@^c@T[j@w@n@w@xFoHdCeDfB}BhCgDvBmCpAeB|AkBrA_Br@cAf@w@n@qAd@mAN_@JWTu@V{@??Pw@Nu@TqAB_@NkADm@BYBQ@QBU@c@@O@]@i@@eA?a@?y@?_A?iB?_A@gBAY@gF?wD?_E?m@EwKAqEAk@?oA?m@AkC?cA?u@AK?]AwA?k@AmC?gA?uAAqA?MAI?G?Y?u@Cs@CcB?M?QAm@Ai@?a@?G?_@@}C?w@?qA@_FCgS?gHAu@@qM?o@?W?[?]@mA?kDAcK?kN?]?eA?m@?k@?cD?uECyI@eA@{G@eFAwB?_DAkB@]?SAaB@{HAaH@sHAoH@qHAoAB{A?Q?}A@}@?aD?iCCcG@aG?W?e@EqCIaAKcAMeA]yBeA{DQs@qAeFu@mCa@yAsAoFe@eBQq@[qAg@}A_A{C_@yAMk@C[AW?_@B]BUFYZ{@FQLUTg@fC}FfAoCnAsCd@kA~@aCZi@EQGWQi@IMW]u@o@Rc@`BoENSDCTEHD`@Z@Bj@t@b@n@PTJLHLFDBFd@a@f@e@T[P[t@cBh@mA~@_Cl@}A|BcGLSFOh@s@RUPOZQZO\\KXEh@Gx@@n@NVHZN\\T\\RVNbDvBLHLFRF\\Dh@@f@CHAj@OPGNKNMRUVa@^cALa@f@oCd@}Bt@cEJu@`@oBz@wDj@oC\\yA`@iBVkAFYFYH]BOBKFUBMFU@I@GBIFWXmA@C@EDKBIDKLULS^g@PUFGHKDEvBqC\\Wf@o@d@m@zCuD`EcFtDyE^c@^g@zBqCdBwBt@aApD{EfB}BrBkCTY~AuBfAyAh@q@rAgB^g@TYX_@`@i@fBaCBU@U@UCgAMiGA[E}BCcAAs@Ae@AoACeBC}@EmBGaEGsDCmAAg@CeA?c@AeAAUEgECkBAqAIiEEeBAm@ASCYG_@CGGWKWGOUi@O[Uo@ISEIM]GOGQKU]cAM[K]ISMYK[Ws@Wm@Si@MIIU]_AEI[{@","length":620},"routeShortName":"522","routeLongName":"PALO ALTO - EASTRIDGE","rentedBike":false,"transitLeg":true,"duration":3645.0,"steps":[]},{"startTime":1458238710000,"endTime":1458243524000,"departureDelay":0,"arrivalDelay":0,"realTime":false,"distance":34225.711008857186,"pathway":false,"mode":"BUS","route":"68","agencyName":"VTA","agencyUrl":"http://www.vta.org","agencyTimeZoneOffset":-25200000,"routeType":3,"routeId":"68","interlineWithPreviousLeg":false,"tripBlockId":"b_6803","headsign":"68 GILROY TRANSIT CTR","agencyId":"VTA","tripId":"1931274","serviceDate":"20160317","from":{"name":"SANTA CLARA & ALMADEN BLVD","stopId":"VTA:410","stopCode":"60410","lon":-121.894948203,"lat":37.333960133,"arrival":1458238485000,"departure":1458238710000,"zoneId":"1","stopIndex":2,"stopSequence":3},"to":{"name":"MONTEREY & SPRING","stopId":"VTA:3444","stopCode":"63444","lon":-121.648378173,"lat":37.122195441,"arrival":1458243524000,"departure":1458243525000,"zoneId":"1","stopIndex":73,"stopSequence":75},"legGeometry":{"points":"yxzbFzr~fVa@gAWq@Oa@c@mASk@iA{CkA}Cw@qBmAeDm@aBMYs@oBtAaALITQn@c@b@[@Az@m@fBmA`EmCXQr@e@zGkELIbAo@PMlEwCb@[pA{@fD{Bh@_@pA}@v@i@xB}ARl@Zv@Pd@b@hATMTOx@i@HEPMTOp@e@PM`@WTQRO~CyB~@m@^[p@a@d@_@FEzAyA`C_Ct@s@pBoB~B}Bn@m@rAqAdAgA??`@c@n@o@DEv@y@`@_@JAPQf@c@v@y@DGJIz@}@LOFEzCyC^_@lDmDFGFGp@q@rBsBlAqAtAqAh@i@jFmFXWZ[~AaBzEoE\\a@@AXWJe@j@i@rAuAh@k@bGcGj@k@x@y@`FaFt@u@`A_AHIfCgCh@k@TStAuAhBiB~AaBlBeBJKJIDE\\Ez@{@~C}C~F}F|@}@hAiABChEgEj@k@PO|D}DtEqEv@w@JKtBsBPOLOz@w@VUNObA_AXWXYJIBCh@e@n@o@p@m@l@i@|@y@d@e@`AcA|@}@dBgBxA{AxBaC|BeCdBiBpCwClAoA^c@fBiBvB{Bh@k@|BaClC_Dv@}@Z_@|@cABCv@{@hAoAj@k@DG`@a@t@y@r@u@x@y@rCoC^a@rC{Cl@o@dAiAXYLMf@g@RUfAeAf@g@FIHIl@q@bAeAVWJM~@_ABEpBqBjAmAFG|@}@?ARQxCyCnAoAvA{Ah@i@b@c@~EcF|AkBx@gAhAiBr@kA\\k@\\e@l@aAjBwCZg@nDwF`DeFFGr@iA~HaMJQ`BmCZc@JQZe@l@aAHO\\k@^m@l@iAd@{@jCeFJQpByDVg@h@eAzG}MxCaGb@}@hF_K|ByEDI@EP[HOFKDGJQn@mAlA_Cb@{@b@}@jDcHfA_BzAoCzAyCvAsCf@iAR_@h@}@FIHIBADGFEDEZORALBNDRLdA`APVNVj@jAJTDV@^EZGXOTONSHQBW?MCUKYWa@o@m@eAIYAIA]@]Fa@HY\\aAHMR_@R]FKTQJUJOHQVk@LS`@w@rCyFZa@`@_@`@Sj@QJh@Pd@Xf@jAbA`CtBX\\HPHXF`@@XDtB@vADfC?^L?L?pA@D?`H?`C?xCApC?bE@P@L@d@Al@?L?H?D?V?^AP?dA?xA?`B?V?`A?X?NAR?\\?L?P?Z?VAH@P?T?nAAP?@?T?|@CZ?|@CvAC~@A^?l@?ZAx@?J?~@E~@?H?|AAvD?v@?P?L??O?O?wA@kA???wA?{D?uA?cA@eEBmC@aADaC?w@?cB?aA?w@BeA?i@Ai@?KDaBBoAH_ARyAZqBJk@No@J]To@z@yBZy@xAoC~BaFFMKKIIm@k@[WaCi@O\\Wr@m@KME]Me@SA?YKUKa@O_@GQHGDGFELEPEH?RBPHR??dGNRg@Vs@N]`Ch@ZVl@j@HHJJTg@lAiC|DcIXm@DId@cAp@wAn@qA|A{CP]fCaF\\o@FODIFKXk@FMf@cA`B{CnBqD|A{Cb@}@Re@Vg@jDkHhA}B^s@BGj@kAHM^y@f@eA`BcCn@_BDMt@kCl@}BVmABIL_AJm@|CwYVsCF{@JeA^qCp@uCr@mB`@_ApA{Bd@s@j@m@h@e@b@c@PMBAb@[^Sl@O`DeA`Bq@NKNKFGr@g@VWJKv@eAhAwBFQt@{BtBcGl@yA@EAYjAcDh@eB~G{P|AaDdAqBvDqGh@{@pBgDdLgQFChBoC\\a@RWlAiA|@s@z@s@lHgIlHiIvGwHbPmQ|@iA^g@b@m@TQ`@e@n@k@@ADOp@c@vAw@t@Y`A[d@I~B_@fOaBjDa@r@Gd@GhC[p@Mn@Sp@Y^Sl@c@tAqAbFcFv@y@j@k@vA}A~FgGxG_H|CqDxEiFn@s@rQgR~IqJ|@_AhEeE~OcPz@}@`OuOlBsBh@k@x@{@@?jIoINAnIqIx@}@~CiDDQfKuKvC_Df@q@P[tDcHl@kAdLwTLGxC}FNYzBaEBSxDcHtHwNjCoFTc@rCeFpFgKLSHCjEkIl@kAxBeE@Kp@uAxAmC`@w@fAaB\\k@\\g@^w@Ri@Ne@Nk@b@mBBUDOPoAJ_B?ITgEJgAFa@^iB`@kA`EqIfCwFf@eAbAyBr@}ArAsCrAuC|DmIPU~@gAd@a@r@c@\\Qz@YXKt@UrBq@H@bCu@f@Oh@QJS^Mx@YjFgBbAW`GqBf@OXKbBk@JCbAa@dAi@l@g@fDsCb@a@l@e@t@o@tAiA\\YvBkBfCuBxFqEh@_@pAcA~EeEhA_Ax@q@XUjCyBd@a@dDqCbA{@_@y@SN[?[k@AAEIBk@VSsBqEoAoCwAeDc@cAxC_CvCeCxCgC`Aw@|AqAxCiCv@q@bBqAhAy@JIFGr@c@`Ak@\\Sl@]JGh@]J[zG{Cd@U","length":732},"routeShortName":"68","routeLongName":"GILROY TC - SAN JOSE DIRIDON","rentedBike":false,"transitLeg":true,"duration":4814.0,"steps":[]},{"startTime":1458243525000,"endTime":1458244516000,"departureDelay":0,"arrivalDelay":0,"realTime":false,"distance":1286.7540000000001,"pathway":false,"mode":"WALK","route":"","agencyTimeZoneOffset":-25200000,"interlineWithPreviousLeg":false,"from":{"name":"MONTEREY & SPRING","stopId":"VTA:3444","stopCode":"63444","lon":-121.648378173,"lat":37.122195441,"arrival":1458243524000,"departure":1458243525000,"zoneId":"1","stopIndex":73,"stopSequence":75},"to":{"name":"s","lon":-121.63790196978937,"lat":37.119158729139805,"arrival":1458244516000,"orig":""},"legGeometry":{"points":"ylqaFfmneVr@]`D}AMa@mBgH_EoNGQCMGStCoCxBsBz@aAdK}KoAoEIYCWGWpBaA","length":18},"rentedBike":false,"transitLeg":false,"duration":991.0,"steps":[{"distance":129.948,"relativeDirection":"DEPART","streetName":"Monterey Street","absoluteDirection":"SOUTHEAST","stayOn":false,"area":false,"bogusName":false,"lon":-121.64835160109276,"lat":37.122210449772,"elevation":[]},{"distance":431.789,"relativeDirection":"LEFT","streetName":"San Pedro Avenue","absoluteDirection":"NORTHEAST","stayOn":false,"area":false,"bogusName":false,"lon":-121.6477376,"lat":37.1211495,"elevation":[]},{"distance":517.768,"relativeDirection":"RIGHT","streetName":"Railroad Avenue","absoluteDirection":"SOUTHEAST","stayOn":false,"area":false,"bogusName":false,"lon":-121.6433439,"lat":37.1228241,"elevation":[]},{"distance":137.472,"relativeDirection":"LEFT","streetName":"Barrett Avenue","absoluteDirection":"NORTHEAST","stayOn":false,"area":false,"bogusName":false,"lon":-121.6396493,"lat":37.1192198,"elevation":[]},{"distance":69.777,"relativeDirection":"RIGHT","streetName":"s","absoluteDirection":"SOUTHEAST","stayOn":false,"area":false,"bogusName":false,"lon":-121.638239,"lat":37.1197266,"elevation":[]}]}],"tooSloped":false}]},"debugOutput":{"precalculationTime":2233,"pathCalculationTime":853,"pathTimes":[852],"renderingTime":1,"totalTime":3087,"timedOut":false}};
var itineraries = dataxt.plan.itineraries;

for (i = 0; i < itineraries.length; i++) {
    for (ii=0; ii < itineraries[i].legs.length; ii++) {

            console.log("jalan los codigos",  itineraries[i].legs[ii].legGeometry.points);


    }
}


var center = config.geocode().center.split(',').map(parseFloat);
 
if (config.map_provider && config.map_provider() !== 'AmigoCloud') {
  L.mapbox.accessToken = config.mapbox_access_token();
}

module.exports = function(el) {
  var map, realtime, southWest, northEast, blurLayer;

  if (config.map_provider && config.map_provider() === 'AmigoCloud') {
    southWest = L.latLng(35.946877085397,-123.480610897013);
    northEast = L.latLng(40.763279543715,-118.789317362500);
    map = (new L.amigo.map(el, {
      amigoLogo: 'right',
      loadAmigoLayers: false,
      inertia: false,
      zoomAnimation: $('.hide-map').css('display') !== 'none',
      maxBounds: L.latLngBounds(southWest, northEast),
      minZoom: 8
    })).setView([center[1], center[0]], config.geocode().zoom);

    L.amigo.auth.setToken(config.support_data_token());

    blurLayer = L.tileLayer(
    'https://www.amigocloud.com/api/v1/users/'+
	'23/projects/3019/datasets/23835/tiles/{z}/{x}/{y}.png?' +
	'token=' + config.support_data_token(),
      {
        name: 'Uncovered Area'
      }
    );

    map.addAuthLayer({
      id: config.mapbox_map_id(),
      accessToken: config.mapbox_access_token(),
      name: 'Gray',
      provider: 'mapbox'
    });
    map.addBaseLayer(L.amigo.AmigoGray);
    map.layersControl.addBaseLayer(
      L.bingLayer(
        config.bing_key(),
	{
	  type: 'Road',
	  attribution: 'Bing Maps'
	}
      ),
      'Bing Road'
    );
    map.layersControl.addOverlay(blurLayer);
    blurLayer.addTo(map);
    module.exports.activeMap = map;

    map.realtimeControl = L.control.toggleRealTime().addTo(map);

    realtime = mapModule.realtime();
  } else {
    map = L.mapbox.map(el, config.mapbox_map_id(), {
      attributionControl: false,
      inertia: false,
      zoomAnimation: false
    }).setView([center[1], center[0]], config.geocode().zoom);
  }

  return map;
};

module.exports.getMap = function () {
  return this.activeMap;
};

