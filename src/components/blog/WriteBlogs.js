import React, { useRef, useState } from 'react';
import JoditEditor from 'jodit-react';
// import { useNavigate } from 'react-router-dom';
import OpenAI from "openai";
import axios from 'axios';
import Layout from '../shop/layout';
import { useHistory } from "react-router-dom";

const inputStyle = {
  width: '100%',
  padding: '8px',
  border: '1px solid #ccc',
  borderRadius: '8px',
  margin: '5px 0px 5px 0'
};
const containerStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh',
  marginTop: '100px'
};

const cardStyle = {
  width: '650px',
  border: '1px solid #ccc',
  borderRadius: '8px',
  padding: '16px',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  backgroundColor: 'white',

};


const WriteBlogs = () => {
  // const navigate = useNavigate();
  const history = useHistory();
  const editor = useRef(null);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [image, setImage] = useState(null);
  const [keypoints, setKeypoints] = useState('');
  const [maxTokens, setMaxTokens] = useState(400);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const generateBlog = async () => {
    try {
      if (generating) {
        return;
      }
      if (keypoints.trim() === '' || apiKey.trim() === '' || title.trim() === '') {
        setGenerating(false);
        alert('Title, keypoints, Api Key & length are required.');
        return;
      }
      // console.log(`Write a blog post about ${title}. Include the following keypoints: ${keypoints}. Add a proper Heading and subheadings for the blog post`)
      setGenerating(true)
      const response = await axios.post('https://api.openai.com/v1/engines/gpt-3.5-turbo-instruct/completions', {
        prompt: `Write a blog post about ${title.trim()} with proper Heading and subheadings in HTML code format. Include the following keypoints: ${keypoints.trim()}. Blog should not look incomplete. Use Paragraphs for each subheadings. `,
        max_tokens: maxTokens,
        temperature: 0.3,
      }, {
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${process.env.REACT_APP_OPENAPIKEY}`,
          'Authorization': `Bearer ${apiKey.trim()}`,
        },
      });
      // console.log(`response is ${JSON.stringify(response)}`)
      if (response.data.choices && response.data.choices[0] && response.data.choices[0].text) {
        const generatedBlog = response.data.choices[0].text;

        setContent(generatedBlog);
        setGenerating(false)
      } else {
        alert('Blog generation failed. Please try again.');
        setGenerating(false)
      }
    } catch (error) {
      alert('Error generating blog. Please try again.');
      setGenerating(false)
    }
  };


  const handleImageChange = (e) => {
    const selectedImage = e.target.files[0];
    setImage(selectedImage);
  };

  const handleUpload = async (e) => {
    if (loading) {
      return;
    }
    setLoading(true)
    if (title.trim() === '' || content.trim() === '' || password.trim() === '' || email.trim() === '') {
      setLoading(false);
      alert('Title, Content, Email and Password are required.');
      return;
    }
    
    
    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('password', password);
    formData.append('email', email.trim());
    if (content) {
      formData.append('blog', content.trim());
    }
    if (image) {
      formData.append('image', image);
    }
    console.log(formData.get('title'))
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/blog/create-blog`, formData);

      if (response.status==200) {
        // const data = await response.json();
        // console.warn(data);
        // alert('Data saved successfully');
        localStorage.setItem('userEmail', email)
        setEmail('');
        setPassword('');
        setContent('');
        setImage(null);
        setTitle('');
        setLoading(false);
        // navigate(-1);
        history.go(-1);
      } else if (response.status == 401) {
        setLoading(false);
        alert("Invalid Creadentials")
      } else if (response.status == 404) {
        setLoading(false);
        alert("User not Found")
      } else {
        setLoading(false);
        alert("Internal Server Error")
      }
    } catch (error) {
      setLoading(false);
      alert("Internal Server Error")
      console.error('Error:', error);
    }
  };
  return (
    <div className='bg-[#F2F2F2]'>
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div className="text-center text-[2.25rem] font-[700] font-[#333333]" 
            style={{position:'relative', textAlign: 'center', marginBottom: '20px', fontWeight: '700', color: '#333333', fontSize: '18px'}}
          >
            <p>Write Your Blog</p>
          </div>
          <form>
            <div>
              <label htmlFor="title">Title</label>
              <input
                type="text"
                id="title"
                style={inputStyle}
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                style={inputStyle}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                style={inputStyle}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="image">Image</label>
              <input
                type="file"
                id="image"
                style={{ width: '100%', padding: '8px', borderRadius: '8px', margin: '0px 100px 0px 0' }}
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>
            <div>
              <label htmlFor="blogContent">Blog Content</label>
              <div style={{ marginTop: '8px' }}>
                <JoditEditor
                  ref={editor}
                  required
                  value={content}
                  onChange={(newContent) => setContent(newContent)}
                // config={}
                />
              </div>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              margin: '20px 0',
            }}>
              <hr style={{ flex: 1, border: 'none', borderTop: '2px solid #ccc' }} />
              <span style={{ padding: '0 20px' }}>OR</span>
              <hr style={{ flex: 1, border: 'none', borderTop: '2px solid #ccc' }} />
            </div>
            <div>
              <label htmlFor="keypoints">Generate with Keypoints</label>
              <input
                type="text"
                id="keypoints"
                style={inputStyle}
                placeholder="Enter keypoints separated by commas (e.g., keypoint1, keypoint2, etc)"
                required
                value={keypoints}
                onChange={(e) => setKeypoints(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="apiKey">Api Key</label>
              <input
                type="text"
                id="apiKey"
                style={inputStyle}
                placeholder="Enter Your Api Key"
                required
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="maxTokens">Set Length</label>
              <input
                type="number"
                id="maxTokens"
                style={inputStyle}
                placeholder='Max Tokens'
                required
                value={maxTokens}
                onChange={(e)=>{
                  const value = e.target.value;
                  if (!isNaN(value)) {
                    setMaxTokens(parseInt(value, 10));
                  }
                }}
              />
            </div>
            <div className="flex justify-between">
              <button type="button" style={{
                padding: '8px 16px',
                background: '#007BFF',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                marginTop: '10px',
                background: 'black',
              }} onClick={handleUpload}>
                {loading ? 'Uploading...' : 'Upload Blog'}
              </button>
              <button type="button" style={{
                padding: '8px 16px',
                background: '#007BFF',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                marginTop: '10px',
                background: 'black',
              }} onClick={generateBlog}>
                {generating ? 'Generating...' : 'Generate Blog'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

};


const WriteBlogsPage = (props)=>{
  return (
      <Layout children={<WriteBlogs/>}/>
  )
}



export default WriteBlogsPage;
