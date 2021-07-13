import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const Chat = () => {
  const socket = io('ws://localhost:81/chat');
  const [nickname, setNickname] = useState('');
  const [room, setRoom] = useState('');
  const [chat, setChat] = useState([]);

  socket.on('connect', () => {
    socket.on(room, data => {
      setChat([...chat, `${data[0]}: ${data[1]}`]);
    });
    socket.on('comeOn' + room, comeOn => {
      setChat([...chat, `${comeOn}`]);
    });
  });

  useEffect(() => {
    const nickname = prompt('What is your nickname?');
    if (!nickname) {
      window.location.reload();
    }
    const room = prompt('입장할 방의 코드를 적어주세요.');
    if (!room) {
      window.location.reload();
    }
    socket.emit('hihi', nickname, room);
    setNickname(nickname);
    setRoom(room);
  }, []);

  // 		// useEffect(()=>{
  // 		//   socket.on('message',({name: ,message})=>{
  // 		// 	setChat([...chat,{name,message}])
  // 		//   })
  // 		// })

  // 		const onTextChange = (e:React.ChangeEvent<HTMLInputElement>) =>{
  // 		  setState({...state,[e.target.name]: e.target.value})
  // 		}

  // 		const onMessageSubmit =(e: React.FormEvent<HTMLFormElement>)=>{
  // 		  e.preventDefault()
  // 		//   const name = state.name;
  // 		  const {name, message} = state;
  // 		  socket.emit('message',{name, message})
  // 		  setState({message : '',name})
  // 		}

  // 		const renderChat =()=>{
  // 		  return chat.map(({name, message},index)=>(
  // 			<div key={index}>
  // 			  <h3>{name}:<span>{message}</span></h3>
  // 			</div>
  // 		  ))
  // 		}

  // 		return (
  // 		  <div className='card'>
  // 			<form onSubmit={onMessageSubmit}>
  // 			  <h1>Message</h1>
  // 			  <div className="name-field">
  // 				<input
  // 				name ="name"
  // 				onChange={e=> onTextChange(e)}
  // 				value={state.name} />

  // 			  </div>
  // 			  <div >
  // 				<input
  // 				name ="message"
  // 				onChange={e=> onTextChange(e)}
  // 				value={state.message}
  // 				id="outlined-multiline-static"
  // 				/>
  // 			  </div>
  // 			  <button>Send Message</button>
  // 			</form>
  // 			<div className="render-chat">
  // 			  <h1>Chat log</h1>
  // 			  {renderChat()}
  // 			</div>
  // 		  </div>
  // 		);
  const msg_send = () => {
    /* 메시지 전송 */
    const message = document.getElementById('msg').value;
    socket.emit('send', room, nickname, message);
    document.getElementById('msg').value = '';
    setChat([...chat, `me: ${message}`]);
  };

  const handleKeyDown = e => {
    if (e.keyCode === 13) msg_send();
  };
  return (
    <div>
      <h1>
        시크릿 채팅방 <span id='room'></span>
      </h1>

      <div id='chatList'>
        {chat.map((msg, idx) => {
          return (
            <div key={idx} style={{ color: 'red' }}>
              {msg}
            </div>
          );
        })}
      </div>
      <canvas></canvas>

      <div id='sendMessage'>
        <input type='text' id='msg' onKeyDown={handleKeyDown} />
        <button onClick={msg_send}>submit</button>
      </div>
    </div>
  );
};
export default Chat;
