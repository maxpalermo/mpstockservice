async function fetchCall(endpoint, action, data) {
    const formData = new FormData();
    formData.append("ajax", 1);
    formData.append("action", action);
    Object.entries(data).forEach(([key, value]) => {
        //se value è un oggetto fai json.stringify
        if (typeof value === "object") {
            value = JSON.stringify(value);
        }
        formData.append(key, value);
    });

    const request = await fetch(endpoint, {
        method: "POST",
        body: formData,
    });

    if (!request.ok) {
        showErrorMessage(`Errore nella chiamata API ${endpoint}:${action}`);
    }

    const response = await request.json();

    return response;
}
