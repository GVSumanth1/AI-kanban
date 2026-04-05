import React from 'react';
import Head from 'next/head';
import { useSession, signOut } from 'next-auth/react';
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './api/auth/[...nextauth]';
import { KanbanBoard } from '@/components/KanbanBoard';
import styles from '@/styles/home.module.css';

export default function Home() {
  const { data: session } = useSession();

  return (
    <>
      <Head>
        <title>AI-Driven Kanban Inbox</title>
        <meta name="description" content="Intelligent email management with n8n and AI" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.header}>
        <h1 className={styles.title}>Kanban Board</h1>
        {session && (
          <div className={styles.userSection}>
            {session.user?.image && (
              <div className={styles.avatar}>
                <img src={session.user.image} alt={session.user.name || 'User'} />
              </div>
            )}
            <div className={styles.userName}>{session.user?.name}</div>
            <button className={styles.logoutButton} onClick={() => signOut()}>
              Logout
            </button>
          </div>
        )}
      </div>

      <main className="main-container">
        <KanbanBoard />
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);
  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }
  return { props: {} };
};
