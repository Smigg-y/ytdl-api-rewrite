function start() {
    function remove(id) {
        document.getElementById(id).removeChild('modal-download');
    }

    function modal(id) {
        document.getElementById(id).innerHTML = document.getElementById(id).innerHTML + `
        <div class="modal-dialog" id="modal-download">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="exampleModalLabel">Modal title</h5>
              <button type="button" class="btn-close" onclick="remove('test')" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              ...
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" onclick="remove('test')">Close</button>
              <button type="button" class="btn btn-primary">Save changes</button>
            </div>
          </div>
        </div>`;
    };

    modal('test');
};