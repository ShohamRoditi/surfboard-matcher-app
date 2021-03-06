import React, { Component } from 'react';
import consts               from '../consts';
import Slider               from 'rc-slider';
import Tooltip              from 'rc-tooltip';
import SurfboardList        from './SurfboardList';
import findAMatch           from '../findAMatch.jpg';
import                      'rc-slider/assets/index.css';
import                      'rc-tooltip/assets/bootstrap.css';

const Handle = Slider.Handle;

class MatchForm extends Component {
    constructor(props) {
        super(props);
        this.result     = [];
        this.name       = null;
        this.email      = this.props.email;
        this.level      = this.props.level;
        this.weight     = this.props.weight;
        this.height     = this.props.height;
        this.socket     = this.props.socket;
        
        this.state = {
            location: consts.ASHDOD,
            sent: false,
            Ashdod: 0,
            Nazare: 0
        }

        this.handle             = this.handle.bind(this);
        this.getMatched         = this.getMatched.bind(this);
        this.renderSent         = this.renderSent.bind(this);
        this.handleHeight       = this.handleHeight.bind(this);
        this.handleWeight       = this.handleWeight.bind(this);
        this.renderDefault      = this.renderDefault.bind(this);
        this.handleLocation     = this.handleLocation.bind(this);
        this.updateUserInfo     = this.updateUserInfo.bind(this);
        this.handleCondition    = this.handleCondition.bind(this);
    }

    componentDidMount(){
        this.socket.emit('connected');
        this.socket.on('conditions', data => {
            this.handleCondition(data.location1, data.location2);
        });
    }

    renderSent() {      
        return (
            <div className = "matchForm">
                {this.renderDefault()}
                <div className = "container">
                    <SurfboardList email = {this.email} products = {false} socket = {this.socket} key = {1}>
                        {this.result}
                    </SurfboardList>
                </div>
            </div>
        )
    }

    handle(props){
        const { value, dragging, index, ...restProps } = props;
        
        return (
            <Tooltip
            prefixCls="rc-slider-tooltip"
            overlay={value}
            visible={dragging}
            placement="top"
            key={index}
            >
                <Handle value={value} {...restProps} />
            </Tooltip>
        );
    }
    
    renderDefault() {
        let self = this;
        let warning;
        
        if(self.state.Ashdod >= consts.MAX_WAVE_HEIGHT || self.state.Nazare >= consts.MAX_WAVE_HEIGHT){

            if(self.state.Ashdod >= consts.MAX_WAVE_HEIGHT && self.state.Nazare >= consts.MAX_WAVE_HEIGHT){
                warning = <article className = "warning">WARNING!
                <p className = "warningText">Due to high sea levels, surfing in <b>Nazaré</b> & <b>Ashdod</b> is 
                                            currently dangerous and not recommended for beginners!</p>
              </article>
            }

            else if(self.state.Ashdod >= consts.MAX_WAVE_HEIGHT){
                warning = <article className = "warning">WARNING!
                                <p className = "warningText">Due to high sea levels, surfing in <b>Ashdod</b> is 
                                                             currently dangerous and not recommended for beginners!</p>
                          </article>
            }

                else if(self.state.Nazare >= consts.MAX_WAVE_HEIGHT){
                    warning = <article className = "warning">WARNING!
                                <p className = "warningText">Due to high sea levels, surfing in <b>Nazaré</b> is 
                                                             currently dangerous and not recommended for beginners!</p>
                              </article>
                }
        }

        return (
            <div className = "matchForm">
                <img src = {findAMatch} alt = "form"></img>
                <div className = "container formContainer">
                    <h2>Find a Match!</h2>
                    <h4>Please Fill the Following</h4>
                    <form onSubmit = {self.getMatched}>
                        <div className = "form-group">
                            <label name = "height">Height</label>
                            <input required type = "name" className = "form-control" id = "Name" defaultValue = {this.height} onChange = {self.handleHeight}/>
                        </div>
                        <div className="form-group">
                            <label name = "weight">Weight</label>
                            <input required className="form-control" id = "weight" defaultValue = {this.weight} onChange = {self.handleWeight}/>
                        </div>

                        <div className="form-group">
                            <label name = "weight">Location</label>
                            <div className = "wrapper">
                                <div className = "toggle_radio">
                                    <input type = "radio" checked = {this.state.location === consts.ASHDOD} className = "toggle_option" 
                                            id = "first_toggle" name = "toggle_option" value = {consts.ASHDOD} onChange = {self.handleLocation}/>
                                    <label className = "firstLabel" htmlFor = "first_toggle"> Ashdod, Israel </label>

                                    <input type = "radio" checked = {this.state.location === consts.NAZARE} className = "toggle_option" 
                                                id = "second_toggle" name = "toggle_option" value = {consts.NAZARE} onChange = {self.handleLocation}/>
                                    <label className = "secondLabel" htmlFor = "second_toggle">Nazaré, Portugal</label>

                                    <div className = "toggle_option_slider"></div>
                                </div>
                            </div>
                            {warning}
                        </div>
                        <div className = "form-group">
                            <label name = "Inputselect">Your Level</label>
                            <div className = "wrapperStyle">
                                <Slider className = "level" min = {0} max = {10} defaultValue = {parseInt(this.level)} handle = {self.handle}/>
                            </div>
                        </div>

                        <article>
                            <p>0 - 3: Taking your very first steps. Barely surfed before.</p>
                            <p>4 - 7: Getting the hang of it. Still covering the basics.</p>
                            <p>8 - 10: You can surf in your sleep! Wanna Challenge yourself.</p>
                        </article>

                        <button type = "submit" className = "btn btn-info submitButton">Match!</button>
                    </form>
                </div>
            </div>  
        );
    }

    getMatched(event){
        event.preventDefault();
        let self = this;
        let level = document.body.getElementsByClassName("rc-slider-handle")[0].getAttribute("aria-valuenow");
        self.level = level; 
        const getMatchedUrl = `${consts.SERVICE_URL}/matchSurfboard?height=${self.height}&weight=${self.weight}&level=${self.level}&location=${self.state.location}`;
        self.result = [];
        self.setState({sent: false});
        let favList;
        const getHistoryUrl = `${consts.SERVICE_URL}/getHistory?email=${self.email}`;

        fetch(getMatchedUrl).then(res => res.json()).then(async json => {
            await fetch(getHistoryUrl).then(res => res.json())
                                        .then(json => favList = json)
                    .catch(err => console.log(err));

            let size = json.length;
            let added = 0;
            /*
                Checking if the user's surfboards history appear in the list of matched surfboards according to parameters in form 
                in order to return surfboards that the user did not see yet(surfboards that are not in his surfboards history).
            */
            for(let i = 0; i < size && added < consts.MATCHED_SHOWN; ++i){
                let favorite = false;

                for(let j = 0; j < favList.length; ++j){
                    if(json[i]._id === favList[j]._id){
                        favorite = true;
                    }
                }
                
                if(favorite){
                    continue;
                }

                self.result.push({id: json[i]._id, brand: json[i].brand, userMinWeight: json[i].userMinWeight, userMaxWeight: json[i].userMaxWeight,
                    width: json[i].width, thickness: json[i].thickness, height: json[i].height, maxSwell: json[i].maxSwell, favorite: favorite});
                
                ++added;
            }
            self.setState({sent: true});
        })
        .catch(err => {
            alert("Bad Input");
            console.log(err);
        });

        this.updateUserInfo();
    }

    updateUserInfo(){
        const updateUrl = `${consts.SERVICE_URL}/updateUser?email=${this.email}&height=${this.height}&weight=${this.weight}&level=${this.level}`;
        console.log("Updating user info...");

        fetch(updateUrl, {
            'method': "PUT",
            headers: {
                'Accept': 'application/json'
            }
        }).then(res => res.json())
            .then(json => {
                if(json.result === 'Failure'){
                    console.log("Nothing to update");
                }
                else console.log("Success!");
            })
        .catch(err => console.log(err));
    }

    handleLocation(event){
        console.log("Location Change: " + event.target.value);
        this.setState({location: parseInt(event.target.value)});
    }

    handleHeight(event){
        this.height = event.target.value;
    }
    
    handleWeight(event){
        this.weight = event.target.value;
    }
    
    handleCondition(Nazare, Ashdod){
        console.log("Nazare': " + Nazare + " Ashdod: " + Ashdod);
        this.setState({
            Nazare: Nazare,
            Ashdod: Ashdod 
        });
    }

    render(){
        return this.state.sent ? this.renderSent() : this.renderDefault();
    }
}            
                
export default MatchForm;