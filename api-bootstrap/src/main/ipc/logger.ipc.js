import { BrowserWindow } from "electron";
import Logger from "../../core/logger/Logger.js";


export default function registerLoggerIPC(){


    Logger.on(
        "log",
        (data)=>{


            BrowserWindow
            .getAllWindows()
            .forEach(window=>{


                window.webContents.send(
                    "logger:new",
                    data
                );


            });


        }
    );


}