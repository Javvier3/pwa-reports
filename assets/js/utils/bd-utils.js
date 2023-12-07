// POST -> Gestiones de datos registro o actualización pasen por aqui

const incidencesDB = new PouchDB('incidences');

const saveIncidence = (incidence) => {
    incidence._id = new Date().toISOString();
    return incidencesDB.put(incidence).then((result) => {
        self.registration.sync.register('incidence-status-post');
        const response = {
            registered: true,
            offline: true,
        };
        return new Response(JSON.stringify(response));

}).cath((err) => {
    return new Response(JSON.stringify({registered: false, offline: true}));
});
};

const saveIncidenceToApi = () => {
    const incidences = [];
    return incidencesDB.allDocs({include_docs: true}).then(async(docs) => {
       
            const {rows} = docs;
            for (const row of rows) {
                const {doc} = row;
                try {
                    const response = await fetch('http://206.189.234.55/api/incidences/status', {
                        method: 'POST',
                        body: JSON.stringify(doc),
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                        },
                    });

                    const data = await response.json();

                    if (data['changed']) {
                        incidences.push(data);
                    }
                } catch (error) {
                    console.log(error);
                }finally{
                    return incidencesDB.remove(doc);
                }
            }
            return Promise.all([...incidences, getAllIncidencesPending()]);
    });
}