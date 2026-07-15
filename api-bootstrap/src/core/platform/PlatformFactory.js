import WindowsPlatform from "./WindowsPlatform.js";
import LinuxPlatform from "./LinuxPlatform.js";
import MacOSPlatform from "./MacOSPlatform.js";


class PlatformFactory {


    static getPlatform() {

        switch(process.platform) {

            case "win32":
                return new WindowsPlatform();


            case "linux":
                return new LinuxPlatform();


            case "darwin":
                return new MacOSPlatform();


            default:
                throw new Error(
                    `Unsupported platform: ${process.platform}`
                );
        }

    }

}


export default PlatformFactory;