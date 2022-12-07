import React, { useState } from "react";
import {
  Alert,
  Card,
  Button,
  Col,
  Container,
  Modal,
  Nav,
  Navbar,
  Row,
} from "react-bootstrap";
import { v4 as uuidv4 } from "uuid";
import "./App.css";
import "./print.css";
import FABCard from "./FABCard";
import sortBy from "lodash/sortBy";
import FABCardSearch from "./FABCardSearch";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { cardDB, cardMap } from "./cardsRepository";
import reduce from "lodash/reduce";

function App() {
  const search = window.location.search;
  const [cardsToPrint, setCardsToPrint] = useState(() => {
    const res = [];
    if (search) {
      const qparams = new URLSearchParams(search);
      if (qparams.get("id")) {
        const qres = cardDB.search(qparams.get("id").replaceAll(",", " "));
        const values = qparams.get("id").split(",");
        const idCountMap = reduce(
          values,
          (acc, id) => {
            if (!acc[id]) {
              return { ...acc, [id]: 1 };
            }
            return { ...acc, [id]: acc[id] + 1 };
          },
          {}
        );
        const countMapKeys = Object.keys(idCountMap);
        qres.map((r) => {
          if (cardMap[r.ref]) {
            let found = false;
            for (let i = 0; i < countMapKeys.length && !found; i++) {
              if (r.ref.includes(countMapKeys[i])) {
                found = true;
                const repeat = idCountMap[countMapKeys[i]];
                for (let j = 0; j < repeat; j++) {
                  res.push({ ...cardMap[r.ref], uuid: uuidv4() });
                }
              }
            }
          }
          return r;
        });
      }
    }
    return sortBy(res, [(card) => card.name]);
  });
  const addCardToPrint = (card) => {
    card = { ...card, uuid: uuidv4() };
    setCardsToPrint((prev) => {
      return sortBy([...prev, card], [(card) => card.name]);
    });
    toast.success("Card added!");
  };
  const removeCardToPrint = (index) => {
    setCardsToPrint((prev) => {
      var cardsCopy = [...prev];
      cardsCopy.splice(index, 1);
      return cardsCopy;
    });
  };

  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={1200}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable={false}
        pauseOnHover={false}
        theme="light"
      />
      <Container className="App">
        <Navbar
          bg="dark"
          variant="dark"
          expand="sm"
          fixed="top"
          className="no-print"
        >
          <Navbar.Brand>FAB Eco Proxy</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="mr-auto">
              <Nav.Link onClick={() => setShowSearchModal(true)}>
                Add Cards
              </Nav.Link>
              <Nav.Link onClick={() => window.print()}>Print</Nav.Link>
              <Nav.Link onClick={() => setShowHelpModal(true)}>Help</Nav.Link>
            </Nav>
            <Navbar.Text>
              <a href="https://ko-fi.com/Q5Q0GUWTY" target="_blank">
                <img
                  height="36"
                  style={{ border: 0, height: 36 }}
                  src="https://storage.ko-fi.com/cdn/kofi5.png?v=3"
                  border="0"
                  alt="Buy Me a Coffee at ko-fi.com"
                />
              </a>
            </Navbar.Text>
          </Navbar.Collapse>
        </Navbar>

        <Modal
          show={showSearchModal}
          onHide={() => setShowSearchModal(false)}
          dialogClassName="search-modal"
          aria-labelledby="search-modal-title"
        >
          <Modal.Header closeButton>
            <Modal.Title id="search-modal-title">Search For Cards</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <FABCardSearch addCardToPrint={addCardToPrint} />
          </Modal.Body>
        </Modal>
        <Modal
          show={showHelpModal}
          onHide={() => setShowHelpModal(false)}
          aria-labelledby="help-modal-title"
        >
          <Modal.Header closeButton>
            <Modal.Title id="help-modal-title">
              How to use FAB Eco Proxy
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <h3>Usage</h3>

            <ol>
              <li>Click "Add Cards"</li>
              <li>Enter card names in the search field</li>
              <li>Click "Add" on the cards you wish to print</li>
              <li>Exit the modal and eventually adjust card quantities</li>
              <li>
                Print using your browsers print fuctionality (landscape for US
                Letter, portrait for A4)
              </li>
            </ol>
            <h3>Feedback</h3>
            <p>
              If you have any feedback, please create a{" "}
              <a href="https://github.com/aongaro/fab-eco-proxy/issues">
                github issue
              </a>
              , and I will try to respond within a reasonable time.
            </p>
          </Modal.Body>
        </Modal>
        {cardsToPrint.length > 0 && (
          <Alert variant="info" className="no-print" style={{ marginTop: 70 }}>
            <div className="d-flex ">
              <div style={{ flex: 1 }}>
                You added {cardsToPrint.length} cards.{" "}
              </div>
              <div className="d-flex justify-content-end"></div>
              <Button
                variant="primary"
                onClick={() => window.print()}
                style={{ marginRight: 10 }}
              >
                Print
              </Button>
              <Button
                variant="primary"
                onClick={() => setShowSearchModal(true)}
              >
                Add cards
              </Button>
            </div>
          </Alert>
        )}
        <Row className="main">
          <Col>
            <div className="card-list">
              {cardsToPrint.map((card, i) => (
                <FABCard
                  key={card.uuid}
                  card={card}
                  addCardToPrint={addCardToPrint}
                  removeCardToPrint={() => removeCardToPrint(i)}
                />
              ))}
            </div>
            {cardsToPrint.length === 0 && (
              <Card style={{ width: "100%" }}>
                <Card.Body>
                  <Card.Text>Start adding cards to the print list.</Card.Text>
                  <div style={{ textAlign: "left" }}>
                    <h3>Usage</h3>

                    <ol>
                      <li>Click "Add Cards"</li>
                      <li>Enter card names in the search field</li>
                      <li>Click "Add" on the cards you wish to print</li>
                      <li>
                        Exit the modal and eventually adjust card quantities
                      </li>
                      <li>
                        Print using your browsers print fuctionality (landscape
                        for US Letter, portrait for A4) or click "Print"
                      </li>
                    </ol>
                  </div>
                  <Button
                    variant="primary"
                    onClick={() => setShowSearchModal(true)}
                  >
                    Add Cards
                  </Button>
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>
      </Container>
      <Container className="no-print bg-light text-muted mt-2">
        <footer className="p-5">
          <Row>
            <Col md="6">
              A special thanks to
              <ul>
                <li>
                  <a href="https://github.com/the-fab-cube/flesh-and-blood-cards">
                    The Fab Cube
                  </a>
                  for card lists.
                </li>
                <li>
                  <a href="https://github.com/cgilling/fab-proxy">cgilling</a>{" "}
                  as this project is inspired by their work.
                </li>
              </ul>
            </Col>
            <Col md="6">
              <p>
                If you liked this project (which is totally free), you can:{" "}
                <a
                  href="https://ko-fi.com/Q5Q0GUWTY"
                  target="_blank"
                  rel="noreferrer"
                >
                  <img
                    height="36"
                    style={{ border: 0, height: 36 }}
                    src="https://storage.ko-fi.com/cdn/kofi5.png?v=3"
                    border="0"
                    alt="Buy Me a Coffee at ko-fi.com"
                  />
                </a>
              </p>
            </Col>
          </Row>
          <Row className="border-top py-4">
            <Col>
              <strong>FAB Eco Proxy</strong> is in no way affiliated with{" "}
              <a href="https://legendstory.com/">Legend Story Studios®</a>. All
              intellectual IP belongs to{" "}
              <a href="https://legendstory.com/">Legend Story Studios®</a>,
              Flesh & Blood™, and set names are trademarks of{" "}
              <a href="https://legendstory.com/">Legend Story Studios®</a>.{" "}
              Flesh and Blood™ characters, cards, logos, and art are property of{" "}
              <a href="https://legendstory.com/">Legend Story Studios®</a>.
            </Col>
          </Row>
        </footer>
      </Container>
    </>
  );
}

export default App;
