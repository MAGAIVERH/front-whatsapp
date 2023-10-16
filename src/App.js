import { useEffect, useState } from 'react';
import './App.css';
import SendMessageIcon from './assets/send.png';
import LogoWhats from './assets/logo-whatsapp-2.png';
import { io } from 'socket.io-client';

function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

const socket = io('http://localhost:4000');

function App() {
  const [privateChats, setPrivateChats] = useState({});
  const [userColors, setUserColors] = useState({});
  const [activeChat, setActiveChat] = useState('group');
  const [groupName, setGroupName] = useState('Network Profissão Programador');

  const [name, setName] = useState('');
  const [joined, setJoined] = useState(false);
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.on('users', (users) => {
      setUsers(users);
      const updatedColors = {};
      users.forEach((user) => {
        if (!userColors[user.name]) {
          updatedColors[user.name] = getRandomColor();
        }
      });
      setUserColors((prevUserColors) => ({
        ...prevUserColors,
        ...updatedColors,
      }));
    }, []);

    socket.on('message', (message) => {
      if (message.recipient && activeChat === message.recipient) {
        setMessages((messages) => [...messages, message]);
      } else if (!message.recipient && activeChat === 'group') {
        setMessages((messages) => [...messages, message]);
      }
    });
  }, [activeChat, userColors]);

  const startPrivateChat = (recipient) => {
    setActiveChat(recipient);
  };

  const handleBackToGroup = () => {
    setActiveChat('group');
  };

  const getActiveChatTitle = () => {
    if (activeChat === 'group') {
      return groupName;
    }
    return activeChat;
  };

  const handleJoin = () => {
    if (name.trim() !== '') {
      const color = getRandomColor();
      setUserColors((prevUserColors) => ({
        ...prevUserColors,
        [name]: color,
      }));
      socket.emit('join', name);
      setJoined(true);
    }
  };

  const handleMessage = () => {
    if (message) {
      if (activeChat === 'group') {
        socket.emit('message', { message, name });
      } else {
        socket.emit('message', { message, name, recipient: activeChat });
      }
      setMessage('');
    }
  };



  if (!joined) {
    return (
      <div className="login-background">
        <div className="login">
          <img src={LogoWhats} className="LogoWhats" alt="" />
          <span className="SeuNome">Digite seu nome</span>
          <input className="nome" placeholder="Nome..." value={name} onChange={(e) => setName(e.target.value)} />
          <button className="botao" onClick={() => handleJoin()}>
            Entrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="back-ground"></div>
      <div className="chat-container">
        <div className="chat-contacts">
          <div className="chat-options">
            <div className="chat-item" onClick={() => handleBackToGroup()}>
              <div className="image-profile-group">{activeChat === 'group' ? 'G' : ''}</div>
              <div className="title-chat-container">
                <span className="title-message">Voltar ao Grupo</span>
              </div>
            </div>

            {users.map((user) => (
              <div className="chat-item" key={user.name} onClick={() => startPrivateChat(user.name)}>
                <div className={`image-profile-user ${activeChat === user.name ? 'active' : ''}`}>
                  {user.name[0]}
                </div>
                <div className="title-chat-container">
                  <span className="title-message">{user.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="chat-messages">
          <div className="chat-options">
            <div className="chat-item" onClick={() => handleBackToGroup()}>
              <div className="image-profile-group">{activeChat === 'group' ? 'G' : ''}</div>
              <div className="title-chat-container">
                <span className="title-message">{getActiveChatTitle()}</span>
                <span className="last-message">
                  {messages.length ? `${messages[messages.length - 1].name}: ${messages[messages.length - 1].message}` : ''}
                </span>
              </div>
            </div>
          </div>

          <div className="chat-messages-area">
            {messages.map((message, index) => (
              <div key={index} className={`user-container-message ${message.name === name ? 'right' : 'left'}`}>
                <div className={`user-message ${message.name === name ? 'user-my-message' : 'user-other-message'}`}>
                  <div className="user-name" style={{ color: userColors[message.name] || 'black' }}>
                    {message.name}
                  </div>
                  {message.message}
                </div>
              </div>
            ))}
          </div>

          <div className="chat-input-area">
            <input className="chat-input" placeholder="Mensagem" value={message} onChange={(e) => setMessage(e.target.value)} />
            <img src={SendMessageIcon} alt="" className="send-message-icon" onClick={() => handleMessage()} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;











