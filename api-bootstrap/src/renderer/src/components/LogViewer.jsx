import { useEffect, useState } from "react";


export default function LogViewer() {

    const [logs, setLogs] = useState([]);


    useEffect(() => {

        const unsubscribe = window.api.logger.onLog(
            (log) => {

                setLogs(prev => [
                    ...prev,
                    log
                ]);

            }
        );


        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };

    }, []);



    return (

        <div>

            <h3>
                Logs
            </h3>


            {
                logs.map(
                    (log, index) => (

                        <p key={index}>

                            [{log.level}]
                            {" "}
                            {log.message}

                        </p>

                    ))
            }


        </div>

    )

}