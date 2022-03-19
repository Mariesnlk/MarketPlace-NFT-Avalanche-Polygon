import React from 'react';
import styles from '../styles/Home.module.css'

export default class Footer extends React.Component {

    render() {
        return (
            <footer className={styles.footer}>
                <a className='text-2xl'>
                    Copyright &copy; 2022 by Mariia Synelnyk
                </a>
            </footer>
        )
    }
}