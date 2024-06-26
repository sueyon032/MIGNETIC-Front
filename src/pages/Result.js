import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import bgImg from '../images/result-bg.png';
import logoimg from '../images/icons/logo.png';
import stars from '../images/stars.png';
import tipimg from '../images/icons/result-graph-tip.png';
import heartPink from '../images/heart-pink.png';
import heartBlue from '../images/heart-blue.png';
import '../css/Result.css';
import Footer from '../components/Footer';
import ResultType from '../components/ResultType';

function Result() {
    const [studentData, setStudentData] = useState();
    const [bestMatch, setBestMatch] = useState();
    const [types, setTypes] = useState(['False', 'True', 'Try', 'Catch', 'Setter', 'Getter']);

    const graphRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];
    const [typeNameIndex, setTypeNameIndex] = useState(0);
    const [graphNum, setGraphNum] = useState([]);
    const defaultTypeNameIndex = 0; // 기본 타입 인덱스

    const [goodFriend, setGoodFriend] = useState(); // 백에서 값 전달
    const [badFriend, setBadFriend] = useState(); // 백에서 값 전달
    const [topFourFriends, setTopFourFriends] = useState([]);

    const [explain, setExplain] = useState({});
    const [bestExplain, setBestExplain] = useState({});
    const [worstExplain, setWorstExplain] = useState({});

    //첫글자 대문자 만들기
    function capitalizeFirstLetter(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // 서버 연동 코드
    useEffect(() => {
        // 세션 스토리지에서 id 가져오기
        const sessionId = sessionStorage.getItem('id');
        // bestMatch에서 type 가져오기
        const sessionType = sessionStorage.getItem('type');

        // 데이터가 없을 경우 fetch 요청을 보내지 않음
        if (!sessionId || !sessionType) {
            return;
        }

        fetch('/api/result', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: sessionId, type: sessionType }),
        })
        .then(response => response.json())
        .then(data => {
            setStudentData(data.studentData)
            setBestMatch(data.bestMatch)
            setGoodFriend(capitalizeFirstLetter(data.bestType))
            setBadFriend(capitalizeFirstLetter(data.worstType))
            setTopFourFriends(data.topFourFriends)
            setTypes(prevTypes => {
                const updatedTypes = [...prevTypes];
                updatedTypes[0] = capitalizeFirstLetter(data.bestMatch); // 0번 인덱스에 bestMatch 값 할당
                return updatedTypes;
            });
            const similarity = data.topFourFriends.map(friend => friend.similarity);
            setGraphNum(similarity);
            setExplain(data.explainResult[0])
            setBestExplain(data.bestExplainResult[0])
            setWorstExplain(data.worstExplainResult[0])
        })

        .catch(error => console.error('Error fetching student data:', error));
    }, [bestMatch]);

    const graphHeights = graphNum.map(num => `${parseInt(num) * 60}px`);

    useEffect(() => {
        let interval;
        let timeout;
        let remainingTime = 3000; // 총 시간 (밀리초 단위)
        const intervalStep = 200;
        let intervalDuration = intervalStep;

        const updateInterval = () => {
            if (remainingTime <= 1000) {
                intervalDuration = 500; // 1초 남았을 때 속도를 500ms로 느리게
            } else {
                intervalDuration = intervalStep;
            }
        };

        const startInterval = () => {
            interval = setInterval(() => {
                setTypeNameIndex(prevIndex => {
                    const nextIndex = prevIndex + 1;
                    return nextIndex < types.length ? nextIndex : 0;
                });
                remainingTime -= intervalDuration;
                updateInterval();
                clearInterval(interval);
                startInterval();
            }, intervalDuration);
        };

        startInterval();

        timeout = setTimeout(() => {
            clearInterval(interval);
            setTypeNameIndex(defaultTypeNameIndex); // 고정값으로 변경
        }, 3000);

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, [defaultTypeNameIndex, types.length]);

    const typeName = types[typeNameIndex];

    const handleIntersection = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const index = graphRefs.findIndex(ref => ref.current === entry.target);
                if (index !== -1 && graphHeights[index]) {
                    requestAnimationFrame(() => {
                        entry.target.style.height = graphHeights[index];
                        entry.target.style.transition = 'height 1s ease';
                    });
                }
                observer.unobserve(entry.target);
            }
        });
    };
    
    useEffect(() => {
        window.scrollTo(0, 0);
    
        const observer = new IntersectionObserver(handleIntersection, { threshold: 0.5 });
        graphRefs.forEach(ref => {
            if (ref.current) {
                observer.observe(ref.current);
            }
        });
    
        return () => {
            observer.disconnect();
        };
    }, [graphHeights]); // graphHeights 값이 변경될 때마다 observer를 업데이트

    useEffect(() => {
        document.body.style.backgroundImage = `url(${bgImg})`;
        document.body.style.backgroundAttachment = 'scroll';
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundRepeat = 'no-repeat';
    }, []);

    const navigate = useNavigate();

    const handleTest = () => {
        navigate('/testselect');
    };

    const handleHotPlace = () => {
        navigate('/hotplace');
    };

    useEffect(() => {
        // 로컬 스토리지에서 postData 가져오기
        const storedData = localStorage.getItem('postData');
        if (storedData) {
            const postData = JSON.parse(storedData);
            console.log(postData); // 콘솔에 출력
        }
    }, []);

    return (
        <div className='result'>
            <img src={logoimg} className="logoimg" />
            <div className='result-container'>
                <div className='type-container'>
                    <div className='your-type your-type-first'>
                        <p>당신의 타입은...</p>
                    </div>
                    <div className='type-name-stars'>
                        <img src={stars} className="stars stars-first" />
                        <div className='type-name'>
                            <p className='type-name-main'>{typeName}</p>
                        </div>
                        <img src={stars} className="stars stars-end" />
                    </div>
                    <div className='your-type your-type-end'>
                        <p>입니다</p>
                    </div>
                </div>
                <div className='type-description'>
                    <div className='type-li-container'>
                        <li className='type-li'>
                            {explain.hashtag} <br/>
                            {explain.intro}
                        </li>
                        <li className='type-li'>
                            장점 <br/>
                            {explain.strength}
                        </li>
                        <li className='type-li'>
                            단점 <br/>
                            {explain.weakness}
                        </li>
                    </div>
                    <div className='good-bad-friend-type'>
                        <div className='good-bad-friend-type-container'>
                            <p className='good-bad-friend good-friend'>잘 맞는 유형</p>
                            <div className='friend-type good-friend-type'>
                                <img src={heartPink} className='heart heart-pink' />
                                <div className='type-name'>
                                    <p className='type-name-friend-good-bad'>{goodFriend}</p>
                                </div>
                                <p className='type-good-bad-description'>{bestExplain.hashtag}</p>
                                <p className='type-details good-type-details'>
                                    {bestExplain.intro}
                                </p>
                            </div>
                        </div>
                        <div className='good-bad-friend-type-container'>
                            <p className='good-bad-friend good-friend'>안 맞는 유형</p>
                            <div className='friend-type bad-friend-type'>
                                <img src={heartBlue} className='heart heart-blue' />
                                <div className='type-name '>
                                    <p className='type-name-friend-good-bad type-name-friend-blue'>{badFriend}</p>
                                </div>
                                <p className='type-good-bad-description'>{worstExplain.hashtag}</p>
                                <p className='type-details bad-type-details'>
                                    {worstExplain.intro}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className='finding-friend-graph'>
                        <div className='finding-friend'>
                            <div className='similar-friend'>
                                <p>나와 비슷한 친구</p>
                            </div>
                            <div className='same-answers'>
                                <p>(10개 중 같은 답을 선택한 개수)</p>
                            </div>
                        </div>
                        <div className='friend-graph-name-container'>
                            <div className='friend-graph-container'>
                                {graphRefs.map((ref, index) => (
                                    <div className={`friend-graph friend-graph-${index + 1}`} key={index}>
                                        {topFourFriends[index]?.name ? (
                                            <p className={`answer answer-num-${index + 1}`}>
                                                {topFourFriends[index]?.similarity}개
                                            </p>
                                        ) : null}
                                        <Link to={`/letterwrite/${topFourFriends[index]?.name}`}>
                                            <div className={`graph graph-${index + 1}`} ref={ref}></div>
                                        </Link>
                                        <p className={`friend-name friend-name-${index + 1}`}>{topFourFriends[index]?.name}</p>
                                    </div>
                                ))}
                            </div>
                            <div className='friend-graph-bg'></div>
                        </div>
                    </div>
                    <div className='graph-tip'>
                        <img src={tipimg} className="tip-img" />
                        <p className='tip-text'>
                            그래프를 클릭하면 그 친구에게 <br></br>
                            편지를 쓸 수 있어요!
                        </p>
                    </div>
                    <div className='type-description-bg'></div>
                </div>
                <div className='btn-container'>
                    <button className='retry-btn' onClick={handleTest}>검사 다시하기</button>
                    <button className='hotplace-btn' onClick={handleHotPlace}>핫플레이스 보기</button>
                </div>
            </div>
            <div className='footer'>
                <Footer position={"result"} />
            </div>
        </div>
    );
}

export default Result;
