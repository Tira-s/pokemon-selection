import { useEffect, useRef, useState } from 'react';
import Select from 'react-select';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import './App.css';
import axios from 'axios';

function App() {
  const [pokemonList, setPokemonList] = useState([]);
  const [pokeData, setPokeData] = useState([]);
  const [savedPokeData, setSavedPokeData] = useState([]);
  const [options, setOptions] = useState([]);

  useEffect(() => {
    let isLoaded = false;
    const fetchData = async () => {
      return await axios
        .get('https://pokeapi.co/api/v2/pokemon?limit=20')
        .then(async (res) => {
          return await res.data.results.map(async (x) => {
            const pokemonRes = await axios.get(x.url);

            if (!isLoaded) {
              setOptions((cur) => [...cur, { value: x.name, label: x.name }]);
              setPokeData((cur) => [...cur, pokemonRes.data]);
              setPokemonList((cur) => [...cur, pokemonRes.data]);
            }
          });
        })
        .catch((res) => {});
    };

    fetchData();

    setSavedPokeData(() => localStorage.getItem('saved_pokemon'));

    return () => {
      isLoaded = true;
    };
  }, []);

  const onSaveHandler = (pokeName) => {
    const pokemonRes = localStorage.getItem('saved_pokemon');
    let pokemonData = null;
    try {
      pokemonData = JSON.parse(pokemonRes);
    } catch {}

    if (pokemonData !== null) {
      const savePokemon = localStorage.setItem(
        'saved_pokemon',
        JSON.stringify([...pokemonData, pokeName])
      );
    } else {
      const savePokemon = localStorage.setItem(
        'saved_pokemon',
        JSON.stringify([pokeName])
      );
    }
    setSavedPokeData(() => localStorage.getItem('saved_pokemon'));
  };

  const onRemoveHandler = (pokeName) => {
    const pokemonRes = JSON.parse(localStorage.getItem('saved_pokemon'));
    const removedPokemon = pokemonRes.filter((x) => x !== pokeName);
    const saveNewPokemon = localStorage.setItem(
      'saved_pokemon',
      JSON.stringify(removedPokemon)
    );

    setSavedPokeData(() => localStorage.getItem('saved_pokemon'));
  };

  const setPokemonView = (e) => {
    if (e.length === 0) {
      setPokemonList([...pokeData]);
    } else {
      const setOption = e.map((x) => x.value);
      const search = pokeData
        .map((x) => {
          if (setOption.includes(x.name)) {
            return x;
          }
        })
        .filter((x) => x !== undefined);
      setPokemonList(search);
    }
  };

  return (
    <>
      <div className='container mx-auto'>
        <h3>Pokemon List</h3>
        {pokeData.length > 0 ? (
          <>
            <div className='d-flex-inline p-2 flex-row justify-content-center'>
              <Select
                className='basic-multi-select'
                classNamePrefix='select ...'
                isMulti
                isSearchable={true}
                onChange={(value) => setPokemonView(value)}
                name='color'
                options={options}
              />
            </div>

            <div className='d-flex flex-row flex-wrap justify-content-center'>
              {pokemonList.map((x, idx) => (
                <Card key={idx} style={{ width: '18rem' }}>
                  <Card.Img variant='top' src={x.sprites.front_shiny} />
                  <Card.Body>
                    <Card.Title>{x.name}</Card.Title>
                    {savedPokeData !== null && savedPokeData.includes(x.name) ? (
                      <Button
                        variant='danger'
                        onClick={() => onRemoveHandler(x.name)}
                      >
                        remove
                      </Button>
                    ) : (
                      <Button
                        variant='success'
                        onClick={() => onSaveHandler(x.name)}
                      >
                        Save
                      </Button>
                    )}
                  </Card.Body>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <>Pokemon Not Found</>
        )}
      </div>
    </>
  );
}

export default App;
