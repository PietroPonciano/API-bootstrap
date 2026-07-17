import ProjectForm from "../components/ProjectForm";
import LogViewer from "../components/LogViewer";

export default function Home() {

    return (

        <main

            style={{

                minHeight: "100vh",

                display: "flex",

                justifyContent: "center",

                alignItems: "center",

                flexDirection: "column",

                gap: 30

            }}

        >

            <h1>
                API Bootstrap
            </h1>


            <p>
                Gerador de APIs automático
            </p>


            <ProjectForm />

            <LogViewer />
        </main>

    );

}