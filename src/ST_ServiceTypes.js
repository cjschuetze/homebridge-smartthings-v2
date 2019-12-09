// const debounce = require('debounce-promise');
var Service;

class ServiceTest {
    constructor(name, testfn) {
        this.ImplementsService = testfn;
        this.Name = name;
    }
}

const serviceMap = {
    alarmSystem: Service.SecuritySystem,
    battery: Service.BatteryService,
    button: Service.StatelessProgrammableSwitch,
    carbonDioxide: Service.CarbonDioxideSensor,
    carbonMonoxide: Service.CarbonMonoxideSensor,
    colorLight: Service.Lightbulb,
    contact: Service.ContactSensor,
    energy: Service.Outlet,
    fan: Service.Fanv2,
    garageDoor: Service.GarageDoorOpener,
    humidity: Service.HumiditySensor,
    illuminance: Service.LightSensor,
    light: Service.Lightbulb,
    lock: Service.LockMechanism,
    mode: Service.Switch,
    motion: Service.MotionSensor,
    power: Service.Outlet,
    presence: Service.OccupencySensor,
    routine: Service.Switch,
    smokeDetector: Service.SmokeSensor,
    sonos: Service.Speaker,
    speaker: Service.Speaker,
    switch: Service.On,
    temperature: Service.TemperatureSensor,
    thermostat: Service.Thermostat,
    valve: Service.Valve,
    water: Service.LeakSensor,
    windowShade: Service.WindowCovering
};

// NOTE: These Tests are executed in order which is important
const serviceTests = [
    new ServiceTest("windowShade", accessory => (accessory.hasCapability('Switch Level') && !accessory.hasCapability('Speaker') && !(accessory.hasCapability('Fan') || accessory.hasCapability('Fan Light') || accessory.hasCapability('Fan Speed') || accessory.hasCapability('Fan Control') || accessory.hasCommand('setFanSpeed') || accessory.hasCommand('lowSpeed') || accessory.hasAttribute('fanSpeed')) && accessory.hasCapability('Window Shade') && (accessory.hasCommand('levelOpenClose') || accessory.hasCommand('presetPosition')))),
    new ServiceTest("lightLevel", accessory => (accessory.hasCapability('Switch Level') && (accessory.hasCapability('LightBulb') || accessory.hasCapability('Fan Light') || accessory.hasCapability('Bulb') || accessory.context.deviceData.name.includes('light') || accessory.hasAttribute('saturation') || accessory.hasAttribute('hue') || accessory.hasAttribute('colorTemperature') || accessory.hasCapability("Color Control")))),
    new ServiceTest("garageDoor", accessory => accessory.hasCapability("Garage Door Control")),
    new ServiceTest("lock", accessory => accessory.hasCapability("Lock")),
    new ServiceTest("valve", accessory => accessory.hasCapability("Valve")),
    new ServiceTest("speaker", accessory => accessory.hasCapability('Speaker')),
    new ServiceTest("fan", accessory => (accessory.hasCapability('Fan') || accessory.hasCapability('Fan Light') || accessory.hasCapability('Fan Speed') || accessory.hasCapability('Fan Control') || accessory.hasCommand('setFanSpeed') || accessory.hasCommand('lowSpeed') || accessory.hasAttribute('fanSpeed'))),
    new ServiceTest("mode", accessory => accessory.hasCapability("Mode")),
    new ServiceTest("routine", accessory => accessory.hasCapability("Routine")),
    new ServiceTest("button", accessory => accessory.hasCapability("Button")),
    new ServiceTest("light", accessory => (accessory.hasCapability('Switch') && (accessory.hasCapability('LightBulb') || accessory.hasCapability('Fan Light') || accessory.hasCapability('Bulb') || accessory.context.deviceData.name.toLowerCase().includes('light')))),
    new ServiceTest("switch", accessory => (accessory.hasCapability('Switch') && !(accessory.hasCapability('LightBulb') || accessory.hasCapability('Fan Light') || accessory.hasCapability('Bulb') || accessory.context.deviceData.name.toLowerCase().includes('light')))),
    new ServiceTest("smokeDetector", accessory => accessory.hasCapability("Smoke Detector") && accessory.hasAttribute('smoke')),
    new ServiceTest("carbonMonoxide", accessory => accessory.hasCapability("Carbon Monoxide Detector") && accessory.hasAttribute('carbonMonoxide')),
    new ServiceTest("carbonDioxide", accessory => accessory.hasCapability("Carbon Dioxide Measurement") && accessory.hasAttribute('carbonDioxideMeasurement')),
    new ServiceTest("motion", accessory => (accessory.hasCapability("Motion Sensor"))),
    new ServiceTest("water", accessory => (accessory.hasCapability("Water Sensor"))),
    new ServiceTest("presence", accessory => (accessory.hasCapability("Presence Sensor"))),
    new ServiceTest("humidity", accessory => (accessory.hasCapability("Relative Humidity Measurement") && !(accessory.hasCapability('Thermostat') || accessory.hasCapability('Thermostat Operating State') || accessory.hasAttribute('thermostatOperatingState')))),
    new ServiceTest("temperature", accessory => (accessory.hasCapability("Temperature Measurement") && !(accessory.hasCapability('Thermostat') || accessory.hasCapability('Thermostat Operating State') || accessory.hasAttribute('thermostatOperatingState')))),
    new ServiceTest("illuminance", accessory => (accessory.hasCapability("Illuminance Measurement"))),
    new ServiceTest("contact", accessory => (accessory.hasCapability('Contact Sensor') && !accessory.hasCapability('Garage Door Control'))),
    new ServiceTest("battery", accessory => (accessory.hasCapability('Battery'))),
    new ServiceTest("energy", accessory => (accessory.hasCapability('Energy Meter') && !accessory.hasCapability('Switch'))),
    new ServiceTest("power", accessory => (accessory.hasCapability('Power Meter') && !accessory.hasCapability('Switch'))),
    new ServiceTest("thermostat", accessory => (accessory.hasCapability('Thermostat') || accessory.hasCapability('Thermostat Operating State') || accessory.hasAttribute('thermostatOperatingState'))),
    new ServiceTest("alarmSystem", accessory => (accessory.hasAttribute("alarmSystemStatus"))),
    new ServiceTest("sonos", accessory => (accessory.context.deviceData.manufacturerName === "Sonos"))
];

function lookupServiceType(name) {
    if (serviceMap[name]) {
        return serviceMap[name];
    }
    return null;
}

module.exports = class ServiceTypes {
    constructor(accessories, srvc) {
        this.platform = accessories;
        this.log = accessories.log;
        this.logConfig = accessories.logConfig;
        this.temperature_unit = accessories.temperature_unit;
        this.accessories = accessories;
        this.client = accessories.client;
        this.myUtils = accessories.myUtils;
        this.CommunityTypes = accessories.CommunityTypes;
        Service = srvc;
        this.homebridge = accessories.homebridge;
    }

    determineServiceType(accessory) {
        for (let i = 0; i < serviceTests.length; i++) {
            const serviceTest = serviceTests[i];
            if (serviceTest.ImplementsService(accessory)) {
                this.log.info("Service type of '" + serviceTest.Name + "' detected.");
                return lookupServiceType(serviceTest.Name);
            }
        }
        return null;
    }
};