import { useRef, useState, useEffect, useCallback } from 'react';

import Places from './components/Places.jsx';
import { AVAILABLE_PLACES } from './data.js';
import Modal from './components/Modal.jsx';
import DeleteConfirmation from './components/DeleteConfirmation.jsx';
import logoImg from './assets/logo.png';
import { sortPlacesByDistance } from './loc.js';

const storedIds = JSON.parse(localStorage.getItem('selectedPlaces')) || [];
const storedPlaces = storedIds.map((id) => AVAILABLE_PLACES.find((place) => place.id === id));

function App() {

  const selectedPlace = useRef();
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [availablePlaces, setAvailablePlaces] = useState([]);
  const [pickedPlaces, setPickedPlaces] = useState(storedPlaces);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {//Essa função serve para saber a localização do usuário (aquele pop-up que aparece),
      //mas ele só vai ser calculado depois da compilação do codigo, e se botarmos o resultado dele como state, toda vez que atualizar a pagina ele vai pedir os dados de novo, aí usamos useEffect.
      const sortedPlaces = sortPlacesByDistance(AVAILABLE_PLACES, position.coords.latitude, position.coords.longitude);
      setAvailablePlaces(sortedPlaces); //ainda estou usando o state
    });
  }, []);//Esse segundo argumento se chama dependencies
  //Como o useEffect vai fazer com que a função do primeiro argumento seja compilada só no final,
  //ela só sera compilada de novo se essas dependencies mudarem, independente se o state atualizou de novo; parece com o useState.

  function handleStartRemovePlace(id) {
    setModalIsOpen(true);
    selectedPlace.current = id;
  }

  function handleStopRemovePlace() {
    setModalIsOpen(false);
  }

  function handleSelectPlace(id) {
    setPickedPlaces((prevPickedPlaces) => {
      if (prevPickedPlaces.some((place) => place.id === id)) {
        return prevPickedPlaces;
      }
      const place = AVAILABLE_PLACES.find((place) => place.id === id);
      return [place, ...prevPickedPlaces];
    });

    const storedIds = JSON.parse(localStorage.getItem('selectedPlaces')) || []; //parse destranforma JSON
    if(storedIds.indexOf(id) === -1){
      localStorage.setItem('selectedPlaces', JSON.stringify([id, ...storedIds])); //stringify transforma em JSON. LocalStorage so guarda string
    }
  }

  const handleRemovePlace = useCallback(function handleRemovePlace() { //Isso faz com que a função não seja recriada quando o App é relido, ou seja, o useEffect não ativa toda hora, é bom usar isso quando a função é dependency do useEffect é uma função
    setPickedPlaces((prevPickedPlaces) =>
      prevPickedPlaces.filter((place) => place.id !== selectedPlace.current)
    );
    setModalIsOpen(false);

    const storedIds = JSON.parse(localStorage.getItem('selectedPlaces')) || []; //parse destranforma JSON
    localStorage.setItem('selectedPlaces', JSON.stringify(storedIds.filter((id) => id !== selectedPlace.current)));
  }, []);

  return (
    <>
      <Modal open={modalIsOpen}>
        <DeleteConfirmation
          onCancel={handleStopRemovePlace}
          onConfirm={handleRemovePlace}
        />
      </Modal>

      <header>
        <img src={logoImg} alt="Stylized globe" />
        <h1>PlacePicker</h1>
        <p>
          Create your personal collection of places you would like to visit or
          you have visited.
        </p>
      </header>
      <main>
        <Places
          title="I'd like to visit ..."
          fallbackText={'Select the places you would like to visit below.'}
          places={pickedPlaces}
          onSelectPlace={handleStartRemovePlace}
        />
        <Places
          title="Available Places"
          places={availablePlaces}
          fallbackText="Sorting places by distance..."
          onSelectPlace={handleSelectPlace}
        />
      </main>
    </>
  );
}

export default App;
