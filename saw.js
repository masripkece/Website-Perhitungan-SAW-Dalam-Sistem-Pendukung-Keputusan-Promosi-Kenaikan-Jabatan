const STORAGE_KEY = "dataAlternatif";
const bobot = [0.25, 0.5, 0.25];

function getData() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function normalisasi(data) {
  const max = [
    Math.max(...data.map(d => d.nilai[0])) || 1,
    Math.max(...data.map(d => d.nilai[1])) || 1,
    Math.max(...data.map(d => d.nilai[2])) || 1,
  ];
  return data.map(alt => {
    const norm = alt.nilai.map((v, i) => v / max[i]);
    return { nama: alt.nama, norm };
  });
}

function hitungSAW(data) {
  return data.map(alt => {
    const skor = alt.norm.reduce((sum, val, i) => sum + val * bobot[i], 0);
    return { nama: alt.nama, skor: skor.toFixed(4) };
  }).sort((a, b) => b.skor - a.skor);
}

document.addEventListener("DOMContentLoaded", () => {
  // Alternatif Page
  if (document.getElementById("form-alternatif")) {
    const form = document.getElementById("form-alternatif");
    const tabel = document.getElementById("tabel-alternatif");

    function renderTabel() {
      const data = getData();
      tabel.innerHTML = "";
      data.forEach((d, i) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${i + 1}</td>
          <td>${d.nama}</td>
          <td>${d.nilai[0]}</td>
          <td>${d.nilai[1]}</td>
          <td>${d.nilai[2]}</td>
          <td>
            <button onclick="editData(${i})">Edit</button>
            <button onclick="hapusData(${i})">Hapus</button>
          </td>
        `;
        tabel.appendChild(tr);
      });
    }

    form.onsubmit = e => {
      e.preventDefault();
      const nama = document.getElementById("nama").value;
      const kerja = parseFloat(document.getElementById("kerja").value);
      const kinerja = parseFloat(document.getElementById("kinerja").value);
      const perilaku = parseFloat(document.getElementById("perilaku").value);
      const data = getData();

      const editIndex = form.dataset.editing;
      if (editIndex !== undefined) {
        // Mode edit
        data[editIndex] = { nama, nilai: [kerja, kinerja, perilaku] };
        delete form.dataset.editing;
        form.querySelector("button").textContent = "Tambah / Simpan";
      } else {
        data.push({ nama, nilai: [kerja, kinerja, perilaku] });
      }

      saveData(data);
      form.reset();
      renderTabel();
    };

    window.hapusData = index => {
      const data = getData();
      data.splice(index, 1);
      saveData(data);
      renderTabel();
    };

    window.editData = index => {
      const data = getData()[index];
      document.getElementById("nama").value = data.nama;
      document.getElementById("kerja").value = data.nilai[0];
      document.getElementById("kinerja").value = data.nilai[1];
      document.getElementById("perilaku").value = data.nilai[2];

      form.dataset.editing = index;
      form.querySelector("button").textContent = "Perbarui";
    };

    renderTabel();
  }

  // Normalisasi Page
  if (document.getElementById("tabel-normalisasi")) {
    const data = getData();
    const normData = normalisasi(data);
    const tbody = document.getElementById("tabel-normalisasi");

    normData.forEach((alt, i) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${i + 1}</td>
        <td>${alt.nama}</td>
        <td>${alt.norm[0].toFixed(4)}</td>
        <td>${alt.norm[1].toFixed(4)}</td>
        <td>${alt.norm[2].toFixed(4)}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  // Perangkingan Page
  if (document.getElementById("tabel-ranking")) {
    const data = getData();
    const normData = normalisasi(data);
    const hasil = hitungSAW(normData);
    const tbody = document.getElementById("tabel-ranking");

    hasil.forEach((alt, i) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${i + 1}</td>
        <td>${alt.nama}</td>
        <td>${alt.skor}</td>
      `;
      tbody.appendChild(tr);
    });
  }
});
