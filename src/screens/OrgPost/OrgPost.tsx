import React, { ChangeEvent, useState } from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Modal from 'react-modal';
import { Form } from 'antd';
import { useMutation, useQuery } from '@apollo/client';
import { useSelector } from 'react-redux';
import Button from 'react-bootstrap/Button';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

import styles from './OrgPost.module.css';
import AdminNavbar from 'components/AdminNavbar/AdminNavbar';
import OrgPostCard from 'components/OrgPostCard/OrgPostCard';
import { ORGANIZATION_POST_LIST } from 'GraphQl/Queries/Queries';
import { CREATE_POST_MUTATION } from 'GraphQl/Mutations/mutations';
import { RootState } from 'state/reducers';
import PaginationList from 'components/PaginationList/PaginationList';

function OrgPost(): JSX.Element {
  const { t } = useTranslation('translation', {
    keyPrefix: 'orgPost',
  });

  document.title = t('title');
  const [postmodalisOpen, setPostModalIsOpen] = useState(false);
  const [postformState, setPostFormState] = useState({
    posttitle: '',
    postinfo: '',
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchState, setSearchState] = useState({
    byTitle: '',
    byText: '',
  });

  const currentUrl = window.location.href.split('=')[1];
  const appRoutes = useSelector((state: RootState) => state.appRoutes);
  const { targets, configUrl } = appRoutes;

  const showInviteModal = () => {
    setPostModalIsOpen(true);
  };
  const hideInviteModal = () => {
    setPostModalIsOpen(false);
  };

  const {
    data,
    loading: loading2,
    error: error_post,
    refetch,
  } = useQuery(ORGANIZATION_POST_LIST, {
    variables: { id: currentUrl },
  });
  const [create, { loading }] = useMutation(CREATE_POST_MUTATION);

  const CreatePost = async (e: ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const { data } = await create({
        variables: {
          title: postformState.posttitle,
          text: postformState.postinfo,
          organizationId: currentUrl,
        },
      });
      /* istanbul ignore next */
      if (data) {
        toast.success('Congratulations! You have Posted Something.');
        refetch();
        setPostFormState({
          posttitle: '',
          postinfo: '',
        });
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (loading || loading2) {
    return (
      <>
        <div className={styles.loader}></div>
      </>
    );
  }

  /* istanbul ignore next */
  if (error_post) {
    window.location.assign('/orglist');
  }

  /* istanbul ignore next */
  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setPage(newPage);
  };
  /* istanbul ignore next */
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchByTitle = (e: any) => {
    const { value } = e.target;
    setSearchState({ ...searchState, byTitle: value });
    const filterData = {
      id: currentUrl,
      filterByTitle: searchState.byTitle,
    };
    refetch(filterData);
  };

  const handleSearchByText = (e: any) => {
    const { value } = e.target;
    setSearchState({ ...searchState, byText: value });
    const filterData = {
      id: currentUrl,
      filterByText: searchState.byText,
    };
    refetch(filterData);
  };

  return (
    <>
      <AdminNavbar targets={targets} url_1={configUrl} />
      <Row>
        <Col sm={3}>
          <div className={styles.sidebar}>
            <div className={styles.sidebarsticky}>
              <h6 className={styles.searchtitle}>{t('postsByTitle')}</h6>
              <input
                type="text"
                id="posttitle"
                placeholder="Search by Title"
                autoComplete="off"
                onChange={handleSearchByTitle}
              />
              <h6 className={styles.searchtitle}>{t('postsByText')}</h6>
              <input
                type="name"
                id="orgname"
                placeholder="Search by Text"
                autoComplete="off"
                onChange={handleSearchByText}
              />
            </div>
          </div>
        </Col>
        <Col sm={8}>
          <div className={styles.mainpageright}>
            <Row className={styles.justifysp}>
              <p className={styles.logintitle}>{t('posts')}</p>
              <Button
                variant="success"
                className={styles.addbtn}
                onClick={showInviteModal}
                data-testid="createPostModalBtn"
              >
                + {t('createPost')}
              </Button>
            </Row>
            <div className={`row ${styles.list_box}`}>
              {data
                ? (rowsPerPage > 0
                    ? data.postsByOrganization.slice(
                        page * rowsPerPage,
                        page * rowsPerPage + rowsPerPage
                      )
                    : rowsPerPage > 0
                    ? data.postsByOrganization.slice(
                        page * rowsPerPage,
                        page * rowsPerPage + rowsPerPage
                      )
                    : data.postsByOrganization
                  ).map(
                    (datas: {
                      _id: string;
                      title: string;
                      text: string;
                      imageUrl: string;
                      videoUrl: string;
                      organizationId: string;
                      creator: { firstName: string; lastName: string };
                    }) => {
                      return (
                        <OrgPostCard
                          key={datas._id}
                          id={datas._id}
                          postTitle={datas.title}
                          postInfo={datas.text}
                          postAuthor={`${datas.creator.firstName} ${datas.creator.lastName}`}
                          postPhoto={datas.imageUrl}
                          postVideo={datas.videoUrl}
                        />
                      );
                    }
                  )
                : null}
            </div>
          </div>
          <div>
            <table>
              <tbody>
                <tr>
                  <PaginationList
                    count={data ? data.postsByOrganization.length : 0}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                  />
                </tr>
              </tbody>
            </table>
          </div>
          <div>
            <table>
              <tbody>
                <tr>
                  <PaginationList
                    count={data ? data.postsByOrganization.length : 0}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                  />
                </tr>
              </tbody>
            </table>
          </div>
        </Col>
      </Row>
      <Modal
        isOpen={postmodalisOpen}
        style={{
          overlay: { backgroundColor: 'grey' },
        }}
        className={styles.modalbody}
        ariaHideApp={false}
      >
        <section id={styles.grid_wrapper}>
          <div className={styles.form_wrapper}>
            <div className={styles.flexdir}>
              <p className={styles.titlemodal}>{t('postDetails')}</p>
              <a onClick={hideInviteModal} className={styles.cancel}>
                <i className="fa fa-times" data-testid="closePostModalBtn"></i>
              </a>
            </div>
            <Form onSubmitCapture={CreatePost}>
              <label htmlFor="posttitle">{t('postTitle')}</label>
              <input
                type="title"
                id="postitle"
                placeholder="Post Title"
                autoComplete="off"
                required
                value={postformState.posttitle}
                onChange={(e) => {
                  setPostFormState({
                    ...postformState,
                    posttitle: e.target.value,
                  });
                }}
              />
              <label htmlFor="postinfo">{t('information')}</label>
              <textarea
                id="postinfo"
                className={styles.postinfo}
                placeholder="What do you want to talk about?"
                autoComplete="off"
                required
                value={postformState.postinfo}
                onChange={(e) => {
                  setPostFormState({
                    ...postformState,
                    postinfo: e.target.value,
                  });
                }}
              />
              <label htmlFor="postphoto" className={styles.orgphoto}>
                {t('image')}:
              </label>
              <input
                accept="image/*"
                id="postphoto"
                name="photo"
                type="file"
                placeholder="Upload Image"
                multiple={false}
                //onChange=""
              />
              <label htmlFor="postvideo">{t('video')}:</label>
              <input
                accept="image/*"
                id="postvideo"
                name="video"
                type="file"
                placeholder="Upload Video"
                multiple={false}
                //onChange=""
              />
              <Button
                type="submit"
                className={styles.greenregbtn}
                variant="success"
                data-testid="createPostBtn"
              >
                <i className="fa fa-plus"></i> {t('addPost')}
              </Button>
            </Form>
          </div>
        </section>
      </Modal>
    </>
  );
}
export default OrgPost;
